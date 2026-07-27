import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { SupportUserRole } from '../../../core/enums/support-user-role.enum';
import { TicketStatus } from '../../../core/enums/ticket-status.enum';
import { Ticket } from '../../../core/models/ticket.model';
import { API_BASE_URL } from '../../../core/utils/api-base-url.token';
import { environment } from '../../../../environments/environment';
import { SupportWorkspaceComponent } from './support-workspace';

describe('SupportWorkspaceComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SupportWorkspaceComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
      ],
    }).compileComponents();
  });

  it('should clear selected ticket filters and return to page one', () => {
    const fixture = TestBed.createComponent(SupportWorkspaceComponent);
    const component = fixture.componentInstance;

    component.ticketFiltersForm.controls.ticketId.setValue('ticket-id');
    component.ticketPage.set(3);
    component.clearTicketFilters();

    expect(component.ticketFiltersForm.controls.ticketId.value).toBe('');
    expect(component.ticketPage()).toBe(1);
  });

  it('should expose ADMIN-only deletion capability for an administrator', () => {
    const fixture = TestBed.createComponent(SupportWorkspaceComponent);
    const component = fixture.componentInstance;

    component.currentUser.update((user) => ({ ...user, role: SupportUserRole.ADMIN }));

    expect(component.canDelete()).toBe(true);
    expect(component.canViewHistory()).toBe(true);
  });

  it('should retain nested ticket relations and accept an unassigned support user', () => {
    const fixture = TestBed.createComponent(SupportWorkspaceComponent);
    const component = fixture.componentInstance;
    const ticket: Ticket = {
      id: 'ticket-id', requester_id: 'requester-id', area_id: 'area-id', handled_by_id: null,
      requester: { id: 'requester-id', name: 'Requester Name', email: 'requester@example.com', phone: '5550100' },
      area: { id: 'area-id', name: 'Technical Support' },
      handled_by: null, subject: 'Ticket subject', description: 'Ticket description', status: TicketStatus.OPEN,
      status_comment: null, attachments: [], created_at: '2026-01-01T00:00:00Z',
      last_update_at: '2026-01-01T00:00:00Z', last_update_acc: 'TICKET_CREATED',
    };

    component.selectTicket(ticket);

    expect(component.selectedTicket()?.requester.name).toBe('Requester Name');
    expect(component.selectedTicket()?.area.name).toBe('Technical Support');
    expect(component.selectedTicket()?.handled_by).toBeNull();
  });
});
