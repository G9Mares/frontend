import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../../core/utils/api-base-url.token';
import { environment } from '../../../../environments/environment';
import { TicketStatus } from '../../../core/enums/ticket-status.enum';
import { RequesterWorkspaceComponent } from './requester-workspace';

describe('RequesterWorkspaceComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('requester_id', 'test-requester-id');

    await TestBed.configureTestingModule({
      imports: [RequesterWorkspaceComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
      ],
    }).compileComponents();
  });

  it('should return to the new ticket view without changing the requester session', () => {
    const fixture = TestBed.createComponent(RequesterWorkspaceComponent);
    const component = fixture.componentInstance;

    component.newTicketForm.setValue({ areaId: 'area-id', subject: 'Previous subject', description: 'Previous description' });
    component.newTicketForm.disable();
    component.mobileView.set('detail');
    component.returnToNewTicketForm();

    expect(component.mobileView()).toBe('newTicket');
    expect(component.activeRequester()).toBeNull();
    expect(component.newTicketForm.getRawValue()).toEqual({ areaId: '', subject: '', description: '' });
    expect(component.newTicketForm.enabled).toBe(true);
  });

  it('should reject more than three attachment files before upload', () => {
    const fixture = TestBed.createComponent(RequesterWorkspaceComponent);
    const component = fixture.componentInstance;
    const input = document.createElement('input');
    const files = Array.from({ length: 4 }, (_, index) =>
      new File(['content'], `file-${index}.pdf`, { type: 'application/pdf' }),
    );

    Object.defineProperty(input, 'files', { value: files });
    component.selectAttachmentFiles({ target: input } as unknown as Event);

    expect(component.selectedFiles()).toEqual([]);
    expect(component.newTicketAlert()).toBe('Select no more than three attachments.');
  });

  it('should create a ticket and upload selected attachments through one submission', () => {
    localStorage.removeItem('requester_id');
    const fixture = TestBed.createComponent(RequesterWorkspaceComponent);
    const component = fixture.componentInstance;
    const httpController = TestBed.inject(HttpTestingController);
    httpController.expectOne(`${environment.apiBaseUrl}/areas`).flush([]);
    component.activeRequester.set({ id: 'requester-id', name: 'Requester', email: 'requester@example.com', phone: '5550100', created_at: '2026-01-01T00:00:00Z', last_update_at: '2026-01-01T00:00:00Z', last_update_acc: 'REQUESTER_CREATED' });
    component.newTicketForm.setValue({ areaId: 'area-id', subject: 'Subject', description: 'Description' });
    component.selectedFiles.set([new File(['attachment'], 'document.pdf', { type: 'application/pdf' })]);

    component.createTicket();

    expect(component.ticketSubmissionStage()).toBe('creating');
    httpController.expectOne({ method: 'POST', url: `${environment.apiBaseUrl}/tickets` }).flush({ ticket_id: 'ticket-id' });
    httpController.expectOne(`${environment.apiBaseUrl}/tickets/ticket-id`).flush({ id: 'ticket-id', requester_id: 'requester-id', area_id: 'area-id', handled_by_id: null, requester: { id: 'requester-id', name: 'Requester', email: 'requester@example.com', phone: '5550100' }, area: { id: 'area-id', name: 'Technical Support' }, handled_by: null, subject: 'Subject', description: 'Description', status: TicketStatus.OPEN, status_comment: null, attachments: [], created_at: '2026-01-01T00:00:00Z', last_update_at: '2026-01-01T00:00:00Z', last_update_acc: 'TICKET_CREATED' });
    expect(component.ticketSubmissionStage()).toBe('uploading');
    httpController.expectOne({ method: 'POST', url: `${environment.apiBaseUrl}/tickets/ticket-id/attachments` }).flush([]);

    expect(component.ticketCreationLoading()).toBe(false);
    expect(component.ticketSubmissionStage()).toBeNull();
    expect(component.selectedFiles()).toEqual([]);
    expect(component.newTicketForm.getRawValue()).toEqual({ areaId: '', subject: '', description: '' });
    expect(component.newTicketAlert()).toBe('Ticket created with 0 attachment(s).');
    httpController.verify();
  });
});
