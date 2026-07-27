import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SupportUserRole } from '../../../core/enums/support-user-role.enum';
import { SupportWorkspaceComponent } from './support-workspace';

describe('SupportWorkspaceComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SupportWorkspaceComponent],
      providers: [provideRouter([])],
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
