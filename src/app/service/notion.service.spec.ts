import { TestBed } from '@angular/core/testing';

import { NotionService } from './notion.service';

describe('NotionService', () => {
  let service: NotionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
