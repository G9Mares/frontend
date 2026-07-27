import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../../core/utils/api-base-url.token';
import { environment } from '../../../../environments/environment';
import { SupportUser } from '../../../core/models/support-user.model';
import { SupportUserRole } from '../../../core/enums/support-user-role.enum';
import { SupportUsersComponent } from './support-users';

describe('SupportUsersComponent', () => {
  let httpController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportUsersComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
      ],
    }).compileComponents();
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('applies filters only after submission and exposes a no-results state', () => {
    const fixture = TestBed.createComponent(SupportUsersComponent);
    const component = fixture.componentInstance;
    httpController.expectOne(`${environment.apiBaseUrl}/support-users`).flush([]);

    component.filters.setValue({ name: 'Ada', email: '', role: '', status: '' });
    expect(component.appliedFilters().name).toBe('');

    component.applyFilters();
    httpController.expectOne(`${environment.apiBaseUrl}/support-users`).flush([]);

    expect(component.appliedFilters().name).toBe('Ada');
    expect(component.hasAppliedFilters()).toBe(true);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('#support-users-no-results-state')).not.toBeNull();
  });

  it('asks for confirmation before replacing a dirty create form with a selected user', () => {
    const fixture = TestBed.createComponent(SupportUsersComponent);
    const component = fixture.componentInstance;
    httpController.expectOne(`${environment.apiBaseUrl}/support-users`).flush([]);
    const user: SupportUser = {
      id: 'support-user-id',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '+52 555 0101',
      role: SupportUserRole.SUPPORT,
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
      last_update_at: '2026-01-01T00:00:00Z',
      last_update_acc: 'SUPPORT_USER_CREATED',
    };

    component.createForm.controls.name.setValue('Unsaved user');
    component.createForm.controls.name.markAsDirty();
    component.selectUser(user);

    expect(component.pendingDiscardUser()).toEqual(user);
    expect(component.selected()).toBeNull();

    component.confirmDiscardCreation();

    expect(component.selected()).toEqual(user);
    expect(component.createForm.dirty).toBe(false);
  });

  it('should keep support user phone input numeric and limited to ten characters', () => {
    const fixture = TestBed.createComponent(SupportUsersComponent);
    const component = fixture.componentInstance;
    httpController.expectOne(`${environment.apiBaseUrl}/support-users`).flush([]);
    const input = document.createElement('input');
    input.value = '98phone7654321';

    component.sanitizePhone({ target: input } as unknown as Event);

    expect(input.value).toBe('987654321');
    expect(component.createForm.controls.phone.value).toBe('987654321');
  });
});
