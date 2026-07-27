import { Injectable, signal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { CreateRequesterRequest, Requester } from '../models/requester.model';

const requesterIdKey = 'requester_id';

@Injectable({ providedIn: 'root' })
export class RequesterService {
  readonly activeRequesterId = signal<string | null>(localStorage.getItem(requesterIdKey));

  register(request: CreateRequesterRequest): Observable<Requester> {
    const timestamp = new Date().toISOString();
    const requester: Requester = {
      id: crypto.randomUUID(),
      ...request,
      created_at: timestamp,
      last_update_at: timestamp,
      last_update_acc: 'mock-requester',
    };

    return of(requester).pipe(delay(250));
  }

  useRequesterId(requesterId: string): void {
    localStorage.setItem(requesterIdKey, requesterId);
    this.activeRequesterId.set(requesterId);
  }
}
