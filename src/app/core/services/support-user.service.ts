import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SupportUser } from '../models/support-user.model';
import { API_BASE_URL } from '../utils/api-base-url.token';

@Injectable({ providedIn: 'root' })
export class SupportUserService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  list(role?: string, isActive?: boolean): Observable<SupportUser[]> {
    let p = new HttpParams();
    if (role) p = p.set('role', role);
    if (isActive !== undefined) p = p.set('is_active', isActive);
    return this.http.get<SupportUser[]>(`${this.apiBaseUrl}/support-users`, { params: p });
  }
  create(payload: object): Observable<SupportUser> {
    return this.http.post<SupportUser>(`${this.apiBaseUrl}/support-users`, payload);
  }
  update(id: string, payload: object): Observable<SupportUser> {
    return this.http.patch<SupportUser>(`${this.apiBaseUrl}/support-users/${id}`, payload);
  }
}
