import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Area } from '../models/area.model';
import { API_BASE_URL } from '../utils/api-base-url.token';

@Injectable({ providedIn: 'root' })
export class AreaService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getActiveAreas(): Observable<Area[]> {
    return this.http.get<Area[]>(`${this.apiBaseUrl}/areas`);
  }
}
