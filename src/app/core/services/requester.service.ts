import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateRequesterRequest, Requester } from '../models/requester.model';
import { API_BASE_URL } from '../utils/api-base-url.token';

const requesterIdKey = 'requester_id';

@Injectable({ providedIn: 'root' })
export class RequesterService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  readonly activeRequesterId = signal<string | null>(localStorage.getItem(requesterIdKey));
  readonly activeRequester = signal<Requester | null>(null);

  register(request: CreateRequesterRequest): Observable<Requester> {
    return this.http.post<Requester>(`${this.apiBaseUrl}/requesters`, request);
  }

  getRequester(requesterId: string): Observable<Requester> {
    return this.http.get<Requester>(`${this.apiBaseUrl}/requesters/${requesterId}`);
  }

  useRequesterId(requesterId: string): void {
    localStorage.setItem(requesterIdKey, requesterId);
    this.activeRequesterId.set(requesterId);
  }

  setActiveRequester(requester: Requester): void {
    this.activeRequester.set(requester);
  }
}
