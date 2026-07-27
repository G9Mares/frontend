import { Injectable, signal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { CreateRequesterRequest, Requester } from '../models/requester.model';

const requesterIdKey = 'requester_id';

@Injectable({ providedIn: 'root' })
export class RequesterService {
  readonly activeRequesterId = signal<string | null>(localStorage.getItem(requesterIdKey));
  readonly activeRequester = signal<Requester | null>(null);
  private readonly requesters = new Map<string, Requester>();

  register(request: CreateRequesterRequest): Observable<Requester> {
    const timestamp = new Date().toISOString();
    const requester: Requester = {
      id: crypto.randomUUID(),
      ...request,
      created_at: timestamp,
      last_update_at: timestamp,
      last_update_acc: 'mock-requester',
    };

    this.requesters.set(requester.id, requester);
    return of(requester).pipe(delay(250));
  }

  getRequester(requesterId: string): Observable<Requester> {
    const storedRequester = this.requesters.get(requesterId);

    if (storedRequester) {
      return of(storedRequester).pipe(delay(200));
    }

    const timestamp = new Date().toISOString();
    const requester: Requester = {
      id: requesterId,
      name: 'Mock Requester',
      email: 'requester@example.com',
      phone: '+1 555 0101',
      created_at: timestamp,
      last_update_at: timestamp,
      last_update_acc: 'mock-system',
    };

    this.requesters.set(requesterId, requester);
    return of(requester).pipe(delay(200));
  }

  useRequesterId(requesterId: string): void {
    localStorage.setItem(requesterIdKey, requesterId);
    this.activeRequesterId.set(requesterId);
  }

  setActiveRequester(requester: Requester): void {
    this.requesters.set(requester.id, requester);
    this.activeRequester.set(requester);
  }
}
