import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, delay, map, of, switchMap } from 'rxjs';
import { TicketStatus } from '../enums/ticket-status.enum';
import { CreateTicketRequest, Ticket } from '../models/ticket.model';
import { PaginatedResponse } from '../models/pagination.model';
import { API_BASE_URL } from '../utils/api-base-url.token';

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
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  readonly requestedTicketId = signal<string | null>(null);
  readonly selectedTicket = signal<Ticket | null>(null);
  private readonly tickets = new Map<string, Ticket>();

  lookupTicket(ticketId: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiBaseUrl}/tickets/${ticketId}`);
  }

  setRequestedTicketId(ticketId: string | null): void {
    this.requestedTicketId.set(ticketId);
  }

  getRequesterTickets(requesterId: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiBaseUrl}/requesters/${requesterId}/tickets`);
  }

  getSupportTickets(filters: SupportTicketFilters): Observable<PaginatedResponse<Ticket>> {
    let params = new HttpParams().set('page', filters.page).set('page_size', filters.pageSize);
    if (filters.requesterId) params = params.set('requester_id', filters.requesterId);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.areaId) params = params.set('area_id', filters.areaId);
    if (filters.dateFrom) params = params.set('created_from', `${filters.dateFrom}T00:00:00.000Z`);
    if (filters.dateTo) params = params.set('created_to', `${filters.dateTo}T23:59:59.999Z`);
    return this.http.get<{ items: Ticket[]; page: number; page_size: number; total: number; total_pages: number }>(`${this.apiBaseUrl}/tickets`, { params }).pipe(map((response) => ({ items: response.items, pagination: { page: response.page, page_size: response.page_size, total: response.total, total_pages: response.total_pages } })));
    /*
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
    */
  }

  createTicket(request: CreateTicketRequest): Observable<Ticket> {
    return this.http
      .post<{ ticket_id: string }>(`${this.apiBaseUrl}/tickets`, request)
      .pipe(switchMap((response) => this.lookupTicket(response.ticket_id)));
  }

  selectTicket(ticket: Ticket | null): void {
    this.selectedTicket.set(ticket);
  }

  updateTicketStatus(ticketId: string, status: TicketStatus, comment?: string): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.apiBaseUrl}/tickets/${ticketId}/status`, { status, comment: comment || null });
    /*
    const ticket = this.tickets.get(ticketId)!;
    const updatedTicket: Ticket = {
      ...ticket,
      status,
      last_update_at: new Date().toISOString(),
      last_update_acc: 'mock-support-user',
    };

    this.tickets.set(ticketId, updatedTicket);
    return of(updatedTicket).pipe(delay(250));
    */
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
        status_comment: null,
        handled_by_id: null,
        attachments: [],
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
        status_comment: null,
        handled_by_id: null,
        attachments: [],
        created_at: '2026-07-25T10:00:00.000Z',
        last_update_at: '2026-07-25T10:00:00.000Z',
        last_update_acc: 'mock-system',
      },
    ].forEach((ticket) => this.tickets.set(ticket.id, ticket));
  }
}
