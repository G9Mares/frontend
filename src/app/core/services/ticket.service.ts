import { Injectable, signal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { TicketStatus } from '../enums/ticket-status.enum';
import { CreateTicketRequest, Ticket } from '../models/ticket.model';
import { PaginatedResponse } from '../models/pagination.model';

export interface SupportTicketFilters {
  ticketId?: string;
  requesterId?: string;
  status?: string;
  areaId?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  readonly requestedTicketId = signal<string | null>(null);
  readonly selectedTicket = signal<Ticket | null>(null);
  private readonly tickets = new Map<string, Ticket>();

  lookupTicket(ticketId: string): Observable<Ticket> {
    const existingTicket = this.tickets.get(ticketId);

    if (existingTicket) {
      return of(existingTicket).pipe(delay(200));
    }

    const timestamp = new Date().toISOString();
    const ticket: Ticket = {
      id: ticketId,
      requester_id: crypto.randomUUID(),
      area_id: 'mock-area-technical-support',
      subject: 'Mock ticket lookup',
      description: 'This provisional ticket was created by the mock lookup service.',
      status: TicketStatus.OPEN,
      created_at: timestamp,
      last_update_at: timestamp,
      last_update_acc: 'mock-system',
    };

    this.tickets.set(ticket.id, ticket);
    return of(ticket).pipe(delay(250));
  }

  setRequestedTicketId(ticketId: string | null): void {
    this.requestedTicketId.set(ticketId);
  }

  getRequesterTickets(requesterId: string): Observable<Ticket[]> {
    const requesterTickets = [...this.tickets.values()].filter(
      (ticket) => ticket.requester_id === requesterId,
    );

    return of(requesterTickets).pipe(delay(200));
  }

  getSupportTickets(filters: SupportTicketFilters): Observable<PaginatedResponse<Ticket>> {
    this.ensureMockTickets();
    let items = [...this.tickets.values()].sort((left, right) =>
      right.created_at.localeCompare(left.created_at),
    );

    if (filters.ticketId) {
      items = items.filter((ticket) => ticket.id.includes(filters.ticketId!));
    }
    if (filters.requesterId) {
      items = items.filter((ticket) => ticket.requester_id.includes(filters.requesterId!));
    }
    if (filters.status) {
      items = items.filter((ticket) => String(ticket.status) === filters.status);
    }
    if (filters.areaId) {
      items = items.filter((ticket) => ticket.area_id === filters.areaId);
    }
    if (filters.dateFrom) {
      items = items.filter((ticket) => ticket.created_at >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      items = items.filter((ticket) => ticket.created_at <= `${filters.dateTo}T23:59:59.999Z`);
    }

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
    const page = Math.min(filters.page, totalPages);
    const startIndex = (page - 1) * filters.pageSize;

    return of({
      items: items.slice(startIndex, startIndex + filters.pageSize),
      pagination: { page, page_size: filters.pageSize, total, total_pages: totalPages },
    }).pipe(delay(250));
  }

  createTicket(request: CreateTicketRequest): Observable<Ticket> {
    const timestamp = new Date().toISOString();
    const ticket: Ticket = {
      id: crypto.randomUUID(),
      requester_id: request.requester_id,
      area_id: request.area_id,
      subject: request.subject,
      description: request.description,
      status: TicketStatus.OPEN,
      created_at: timestamp,
      last_update_at: timestamp,
      last_update_acc: 'mock-requester',
    };

    this.tickets.set(ticket.id, ticket);
    return of(ticket).pipe(delay(250));
  }

  selectTicket(ticket: Ticket | null): void {
    this.selectedTicket.set(ticket);
  }

  updateTicketStatus(ticketId: string, status: TicketStatus): Observable<Ticket> {
    const ticket = this.tickets.get(ticketId)!;
    const updatedTicket: Ticket = {
      ...ticket,
      status,
      last_update_at: new Date().toISOString(),
      last_update_acc: 'mock-support-user',
    };

    this.tickets.set(ticketId, updatedTicket);
    return of(updatedTicket).pipe(delay(250));
  }

  private ensureMockTickets(): void {
    if (this.tickets.size > 0) {
      return;
    }

    [
      {
        id: 'mock-ticket-1',
        requester_id: 'mock-requester-1',
        area_id: 'mock-area-technical-support',
        subject: 'Cannot access the portal',
        description: 'The requester cannot access the support portal.',
        status: TicketStatus.OPEN,
        created_at: '2026-07-26T14:00:00.000Z',
        last_update_at: '2026-07-26T14:20:00.000Z',
        last_update_acc: 'mock-support-user',
      },
      {
        id: 'mock-ticket-2',
        requester_id: 'mock-requester-2',
        area_id: 'mock-area-account-services',
        subject: 'Update contact information',
        description: 'The requester needs to update their contact information.',
        status: TicketStatus.OPEN,
        created_at: '2026-07-25T10:00:00.000Z',
        last_update_at: '2026-07-25T10:00:00.000Z',
        last_update_acc: 'mock-system',
      },
    ].forEach((ticket) => this.tickets.set(ticket.id, ticket));
  }
}
