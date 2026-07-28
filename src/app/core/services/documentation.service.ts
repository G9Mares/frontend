import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';

export interface DocumentationSources {
  frontend: string;
  backend: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentationService {
  private readonly http = inject(HttpClient);

  getSources(): Observable<DocumentationSources> {
    return forkJoin({
      frontend: this.http.get('/documentacion/frontend-documentation.md', { responseType: 'text' }),
      backend: this.http.get('/documentacion/backend-documentation.md', { responseType: 'text' }),
    });
  }
}
