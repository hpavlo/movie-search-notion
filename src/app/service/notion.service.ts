import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MovieDatabaseService } from './movie-database.service';
import { DbResponse } from '../model/dbResponse';
import { AppComponent } from '../app.component';

@Injectable({
  providedIn: 'root',
})
export class NotionService {
  private apiUrl = 'https://api.notion.com/v1';
  private corsProxyUrl = 'https://cors-proxy1.p.rapidapi.com/v1';
  private backdropUrl = 'https://image.tmdb.org/t/p/original/';
  private apiHeaders = {
    'Authorization': `${localStorage.getItem('notion_token')}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  };
  private corsProxyHeaders = {
    'x-rapidapi-key': `${localStorage.getItem('cors_token')}`,
    'Content-Type': 'application/json'
  };

  constructor(
    private http: HttpClient,
    private dbService: MovieDatabaseService
  ) {}

  public addToMovieDb(id: number, appComponent: AppComponent) {
    this.dbService.getMovieInfo(id).subscribe(info => {
      this.sendRequestWithCorsProxy(
        `${this.apiUrl}/pages`,
        {
          parent: { database_id: `${localStorage.getItem('movie_db_id')}` },
          cover: {
            external: {
              url: this.backdropUrl + info.backdrop_path,
            },
          },
          properties: {
            Name: { title: [{ text: { content: info.original_title } }] },
            Title: {
              rich_text: [
                {
                  text: {
                    content: this.dbService.getUkrainianMovieTitle(id),
                  },
                },
              ],
            },
            Genres: {
              multi_select: info.genres.map((genre) => {
                return { name: genre.name };
              }),
            },
            Overview: { rich_text: [{ text: { content: info.overview } }] },
            Tagline: { rich_text: [{ text: { content: info.tagline } }] },
            Cast: {
              rich_text: [
                {
                  text: {
                    content: this.castFormat(this.dbService.getMovieCast(id)),
                  },
                },
              ],
            },
            Countries: {
              rich_text: [
                {
                  text: {
                    content: info.production_countries
                      .map((country) => country.name)
                      .join(', '),
                  },
                },
              ],
            },
            'Release Date': { date: { start: info.release_date } },
            Runtime: {
              rich_text: [
                { text: { content: `${this.timeFormat(info.runtime)}` } },
              ],
            },
          },
        },
        res => {
          if (res.status_code == 200) {
            appComponent.addButtonText = 'Added';
          }
        }
      );
    });
  }

  public addToTvDb(id: number, appComponent: AppComponent) {
    this.dbService.getTvInfo(id).subscribe(info => {
      this.sendRequestWithCorsProxy(
        `${this.apiUrl}/pages`,
        {
          parent: { database_id: `${localStorage.getItem('tv_db_id')}` },
          cover: {
            external: {
              url: this.backdropUrl + info.backdrop_path,
            },
          },
          properties: {
            Name: { title: [{ text: { content: info.original_name } }] },
            Title: {
              rich_text: [
                { text: { content: this.dbService.getUkrainianTvTitle(id) } },
              ],
            },
            Genres: {
              multi_select: info.genres.map((genre) => {
                return { name: genre.name };
              }),
            },
            Overview: { rich_text: [{ text: { content: info.overview } }] },
            Tagline: { rich_text: [{ text: { content: info.tagline } }] },
            Cast: {
              rich_text: [
                {
                  text: {
                    content: this.castFormat(this.dbService.getTvCast(id)),
                  },
                },
              ],
            },
            Countries: {
              rich_text: [
                {
                  text: {
                    content: info.production_countries
                      .map((country) => country.name)
                      .join(', '),
                  },
                },
              ],
            },
            'Air Date': {
              date: {
                start: info.first_air_date,
                end: info.in_production ? null : info.last_air_date,
              },
            },
            Seasons: { number: info.number_of_seasons },
            Episodes: { number: info.number_of_episodes },
            'Episode Runtime': {
              rich_text: [
                {
                  text: {
                    content: info.episode_run_time
                      .map((time) => this.timeFormat(time))
                      .join(' - '),
                  },
                },
              ],
            },
          },
        },
        res => {
          if (res.status_code == 200) {
            appComponent.addButtonText = 'Added';
          }
        }
      );
    });
  }

  private timeFormat(time: number): string {
    const hour = (time - (time % 60)) / 60;
    return hour > 0 ? `${hour}h ${time % 60}m` : `${time}m`;
  }

  private castFormat(response: DbResponse): string {
    return response.cast
      .slice(0, 10)
      .map((actor) => {
        return `${actor.character} - ${actor.name}`;
      })
      .join(', ');
  }

  public tokenAndDatabasesValidation(
    token: string,
    movieDbId: string,
    tvDbId: string
  ): boolean {
    const movieDbTestUrl = `${this.apiUrl}/databases/${movieDbId}/query`;
    const tvDbTestUrl = `${this.apiUrl}/databases/${tvDbId}/query`;
    return (
      this.sendTestRequest(movieDbTestUrl, token) &&
      this.sendTestRequest(tvDbTestUrl, token)
    );
  }

  private sendTestRequest(url: string, token: string): boolean {
    var request = new XMLHttpRequest();
    request.open('POST', this.corsProxyUrl, false);
    request.setRequestHeader('x-rapidapi-key', `${localStorage.getItem('cors_token')}`);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(
      JSON.stringify(
        {
          'url': url,
          'method': 'POST',
          'params': {},
          'data': {},
          'json_data': {},
          'headers': {
            'Authorization': token,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
          },
          'cookies': {}
        }  
      )
    );
    return request.status == 200 && JSON.parse(request.response).status_code == 200;
  }

  private sendRequestWithCorsProxy(url: string, body: any, subscribeAction: ((value: any) => void)) {
    this.http.post(
      this.corsProxyUrl,
      {
        'url': url,
        'method': 'POST',
        'params': {},
        'data': {},
        'json_data': body,
        'headers': this.apiHeaders,
        'cookies': {}
      },
      {
        headers: this.corsProxyHeaders
      }
    ).subscribe(subscribeAction);
  }
}
