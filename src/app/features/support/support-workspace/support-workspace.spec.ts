import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { SupportUserRole } from '../../../core/enums/support-user-role.enum';
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
});
