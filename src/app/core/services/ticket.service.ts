import { Injectable, signal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { TicketLookupSession } from '../models/ticket-lookup-session.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  readonly requestedTicketId = signal<string | null>(null);

  lookupTicket(ticketId: string): Observable<TicketLookupSession> {
    const session: TicketLookupSession = {
      ticketId,
      requesterId: crypto.randomUUID(),
    };

    return of(session).pipe(delay(250));
  }

  setRequestedTicketId(ticketId: string): void {
    this.requestedTicketId.set(ticketId);
  }
}
