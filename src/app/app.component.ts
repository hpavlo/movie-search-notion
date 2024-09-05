import { Component } from '@angular/core';
import { MovieDatabaseService } from 'src/app/service/movie-database.service';
import { DbResponse } from './model/dbResponse';
import { GenresMap } from './model/genresMap';
import { NotionService } from './service/notion.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  private posterUrl = 'https://image.tmdb.org/t/p/original/';
  allSecretsAreAvailable: boolean = true;
  secrets: string = '';
  errorMessage: string | any = null;

  searchQuery: string = '';
  isMovieSelected: boolean = true;
  response: DbResponse | any = null;
  movieIndex: number = 0;
  posterPath: string | any = null;
  title: string = '';
  date = null;
  genres: string = '';

  addButtonText: string = 'Add';

  constructor(
    private dbService: MovieDatabaseService,
    private notionService: NotionService
  ) {
    this.checkSecretsAvailability();
  }

  search() {
    if (this.searchQuery == '/r') {
      localStorage.clear();
      this.allSecretsAreAvailable = false;
      return;
    }
    this.movieIndex = 0;
    this.dbService
      .search(this.searchQuery, this.isMovieSelected)
      .subscribe((resp) => {
        this.response = resp;
        this.getMovieInfo();
      });
  }

  addToDb() {
    if (this.addButtonText != 'Add') {
      return;
    }
    if (this.isMovieSelected) {
      this.notionService.addToMovieDb(
        this.response.results[this.movieIndex].id,
        this
      );
    } else {
      this.notionService.addToTvDb(
        this.response.results[this.movieIndex].id,
        this
      );
    }
  }

  getMovieInfo(deltaIndex: number = 0) {
    if (this.addButtonText != 'Add') {
      this.addButtonText = 'Add';
    }

    if (this.response.results.length == 0) {
      return;
    }
    this.movieIndex += deltaIndex;
    const result = this.response.results[this.movieIndex];
    if (result.poster_path) {
      this.posterPath = this.posterUrl + result.poster_path;
    } else {
      this.posterPath = null;
    }
    this.genres = this.getGenreNames(result.genre_ids);
    if (this.isMovieSelected) {
      this.title = result.title;
      this.date = result.release_date;
    } else {
      this.title = result.name;
      this.date = result.first_air_date;
    }
  }

  getGenreNames(genreIds: [number]): string {
    let genreNames: string = '';
    for (let i = 0; i < genreIds.length; i++) {
      const id = genreIds[i];
      if (GenresMap.genresMap.has(id)) {
        genreNames +=
          GenresMap.genresMap.get(id)! + (i + 1 == genreIds.length ? '' : ', ');
      }
    }
    return genreNames;
  }

  checkSecretsAvailability() {
    if (
      localStorage.getItem('tmdb_key') == null ||
      localStorage.getItem('notion_token') == null ||
      localStorage.getItem('cors_token') == null ||
      localStorage.getItem('movie_db_id') == null ||
      localStorage.getItem('tv_db_id') == null
    ) {
      this.allSecretsAreAvailable = false;
    }
  }

  saveSecrets() {
    const secretArray = this.secrets.split(',');
    if (secretArray.length != 5) {
      this.errorMessage = 'Format is incorrect';
      return;
    }
    const tmdb_key = secretArray[0];
    const notion_token = secretArray[1];
    const cors_token = secretArray[2];
    const movie_db_id = secretArray[3];
    const tv_db_id = secretArray[4];

    localStorage.setItem('cors_token', cors_token);

    if (!this.dbService.apiKeyValidation(tmdb_key)) {
      this.errorMessage = 'TMDB API key is incorrect';
      return;
    }
    if (
      !this.notionService.tokenAndDatabasesValidation(
        notion_token,
        movie_db_id,
        tv_db_id
      )
    ) {
      this.errorMessage = 'Notion token or ids are incorrect';
      return;
    }

    localStorage.setItem('tmdb_key', tmdb_key);
    localStorage.setItem('notion_token', notion_token);
    localStorage.setItem('movie_db_id', movie_db_id);
    localStorage.setItem('tv_db_id', tv_db_id);
    this.allSecretsAreAvailable = true;
  }
}
