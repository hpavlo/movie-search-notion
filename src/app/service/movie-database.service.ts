import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DbResponse } from '../model/dbResponse';
import { MovieInfo } from '../model/movieInfo';
import { TvInfo } from '../model/tvInfo';

@Injectable({
  providedIn: 'root',
})
export class MovieDatabaseService {
  private apiUrl = 'https://api.themoviedb.org/3';

  constructor(private http: HttpClient) {}

  public search(
    query: string,
    isMovieSelected: boolean
  ): Observable<DbResponse> {
    const url = `${this.apiUrl}/search/${
      isMovieSelected ? 'movie' : 'tv'
    }?query=${query}&api_key=${localStorage.getItem('tmdb_key')}`;
    return this.http.get<DbResponse>(url);
  }

  public getMovieInfo(id: number): Observable<MovieInfo> {
    const url = `${this.apiUrl}/movie/${id}?api_key=${localStorage.getItem(
      'tmdb_key'
    )}`;
    return this.http.get<MovieInfo>(url);
  }

  public getTvInfo(id: number): Observable<TvInfo> {
    const url = `${this.apiUrl}/tv/${id}?api_key=${localStorage.getItem(
      'tmdb_key'
    )}`;
    return this.http.get<TvInfo>(url);
  }

  public getMovieCast(id: number): DbResponse {
    // Use HttpClient
    const url = `${
      this.apiUrl
    }/movie/${id}/credits?api_key=${localStorage.getItem('tmdb_key')}`;
    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);
    return JSON.parse(request.responseText);
  }

  public getTvCast(id: number): DbResponse {
    const url = `${this.apiUrl}/tv/${id}/credits?api_key=${localStorage.getItem(
      'tmdb_key'
    )}`;
    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);
    return JSON.parse(request.responseText);
  }

  public getUkrainianMovieTitle(id: number): string {
    const url = `${this.apiUrl}/movie/${id}?api_key=${localStorage.getItem(
      'tmdb_key'
    )}&language=uk-UA`;
    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);
    return JSON.parse(request.responseText).title;
  }

  public getUkrainianTvTitle(id: number): string {
    const url = `${this.apiUrl}/tv/${id}?api_key=${localStorage.getItem(
      'tmdb_key'
    )}&language=uk-UA`;
    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);
    return JSON.parse(request.responseText).name;
  }

  public apiKeyValidation(key: string): boolean {
    const testUrl = `${this.apiUrl}/genre/movie/list?api_key=${key}`;
    var request = new XMLHttpRequest();
    request.open('GET', testUrl, false);
    request.send(null);
    return request.status == 200;
  }
}
