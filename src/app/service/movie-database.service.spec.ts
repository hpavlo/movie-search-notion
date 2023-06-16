import { TestBed } from '@angular/core/testing';

import { MovieDatabaseService } from './movie-database.service';

describe('MovieDatabaseService', () => {
  let service: MovieDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovieDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
