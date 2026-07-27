import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Area } from '../models/area.model';

@Injectable({ providedIn: 'root' })
export class AreaService {
  getActiveAreas(): Observable<Area[]> {
    const timestamp = new Date().toISOString();

    return of([
      {
        id: 'mock-area-technical-support',
        name: 'Technical Support',
        is_active: true,
        created_at: timestamp,
        last_update_at: timestamp,
        last_update_acc: 'mock-system',
      },
      {
        id: 'mock-area-account-services',
        name: 'Account Services',
        is_active: true,
        created_at: timestamp,
        last_update_at: timestamp,
        last_update_acc: 'mock-system',
      },
    ]).pipe(delay(250));
  }
}
