import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../../core/utils/api-base-url.token';
import { environment } from '../../../../environments/environment';
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

    component.mobileView.set('detail');
    component.returnToNewTicketForm();

    expect(component.mobileView()).toBe('newTicket');
    expect(component.activeRequester()).toBeNull();
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
});
