import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { AuditLog } from '../models/audit-log.model';
import { PaginatedResponse } from '../models/pagination.model';

export interface AuditLogFilters {
  performedBy?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly logs: AuditLog[] = [
    {
      id: 'mock-audit-log-1',
      entity_type: 'Ticket',
      entity_id: 'mock-ticket-1',
      action: 'TICKET_CREATED',
      performed_by: { id: 'mock-support-user-id', name: 'Support User', email: 'support@example.com' },
      created_at: '2026-07-26T14:20:00.000Z',
      metadata: { source: 'mock' },
    },
    {
      id: 'mock-audit-log-2',
      entity_type: 'Requester',
      entity_id: 'mock-requester-1',
      action: 'REQUESTER_CREATED',
      performed_by: null,
      created_at: '2026-07-26T13:10:00.000Z',
      metadata: { source: 'mock' },
    },
  ];

  getAuditLogs(filters: AuditLogFilters): Observable<PaginatedResponse<AuditLog>> {
    let items = [...this.logs].sort((left, right) => right.created_at.localeCompare(left.created_at));

    if (filters.performedBy) {
      items = items.filter((log) => this.actorName(log).toLowerCase().includes(filters.performedBy!.toLowerCase()));
    }
    if (filters.action) {
      items = items.filter((log) => log.action === filters.action);
    }
    if (filters.entityType) {
      items = items.filter((log) => log.entity_type === filters.entityType);
    }
    if (filters.entityId) {
      items = items.filter((log) => log.entity_id.includes(filters.entityId!));
    }
    if (filters.dateFrom) {
      items = items.filter((log) => log.created_at >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      items = items.filter((log) => log.created_at <= `${filters.dateTo}T23:59:59.999Z`);
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

  actorName(log: AuditLog): string {
    return typeof log.performed_by === 'string'
      ? log.performed_by
      : log.performed_by?.name ?? 'System';
  }
}
