import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupportUserService } from '../../../core/services/support-user.service';
import { SupportUser } from '../../../core/models/support-user.model';
import { AuthService } from '../../../core/services/auth.service';
import { AppAlertComponent } from '../../../shared/components/app-alert/app-alert';

type AlertVariant = 'error' | 'success';

interface SupportUserAlert {
  message: string;
  variant: AlertVariant;
}

interface SupportUserFilters {
  name: string;
  email: string;
  role: string;
  status: string;
}

@Component({
  selector: 'app-support-users',
  imports: [AppAlertComponent, ReactiveFormsModule],
  templateUrl: './support-users.html',
})
export class SupportUsersComponent {
  private readonly service = inject(SupportUserService);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly users = signal<SupportUser[]>([]);
  readonly selected = signal<SupportUser | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly alert = signal<SupportUserAlert | null>(null);
  readonly filters = this.fb.nonNullable.group({ name: '', email: '', role: '', status: '' });
  readonly appliedFilters = signal<SupportUserFilters>({ name: '', email: '', role: '', status: '' });
  readonly filtersOpen = signal(false);
  readonly mobileDrawerOpen = signal(false);
  readonly activeWorkspace = signal<'list' | 'detail'>('list');
  readonly pendingDiscardUser = signal<SupportUser | null>(null);
  readonly pendingNavigationUrl = signal<string | null>(null);
  readonly formSubmitted = signal(false);
  readonly viewportWidth = signal(typeof window === 'undefined' ? 1024 : window.innerWidth);
  readonly isMobile = computed(() => this.viewportWidth() < 768);
  readonly isTablet = computed(() => this.viewportWidth() >= 768 && this.viewportWidth() < 1024);
  readonly hasAppliedFilters = computed(() => Object.values(this.appliedFilters()).some(Boolean));
  readonly currentUser = computed(() => this.auth.getCurrentMockUser());
  readonly pendingToggle = signal(false);
  readonly pendingRole = signal(false);
  readonly selectedRole = signal<'SUPERVISOR' | 'SUPPORT'>('SUPPORT');
  readonly createForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    role: ['', Validators.required],
  });
  constructor() {
    this.load();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.viewportWidth.set(window.innerWidth);
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const v = this.appliedFilters();
    this.service.list(v.role || undefined, v.status ? v.status === 'ACTIVE' : undefined).subscribe({
      next: (u) => {
        this.users.set(
          u
            .filter(
              (x) =>
                x.name.toLowerCase().includes(v.name.toLowerCase()) &&
                x.email.toLowerCase().includes(v.email.toLowerCase()),
            )
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
        this.loading.set(false);
      },
      error: () => {
        const message = 'Unable to load support users.';
        this.error.set(message);
        this.showAlert(message, 'error');
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.appliedFilters.set(this.filters.getRawValue());
    this.filtersOpen.set(false);
    this.load();
  }

  clearFilters(): void {
    this.filters.reset();
    this.appliedFilters.set({ name: '', email: '', role: '', status: '' });
    this.filtersOpen.set(false);
    this.load();
  }

  create(): void {
    const v = this.createForm.getRawValue();
    this.formSubmitted.set(true);
    if (this.createForm.invalid || this.passwordsDoNotMatch()) return;
    this.service
      .create({ name: v.name, email: v.email, phone: v.phone, password: v.password, role: v.role })
      .subscribe({
        next: (u) => {
          this.selected.set(u);
          this.createForm.reset();
          this.formSubmitted.set(false);
          this.showAlert('Support user created successfully.', 'success');
          this.load();
        },
        error: (error) => this.showAlert(this.createErrorMessage(error), 'error'),
      });
  }
  isSelf(user: SupportUser): boolean {
    return user.id === this.auth.getCurrentMockUser().id;
  }

  passwordsDoNotMatch(): boolean {
    const { password, confirmPassword } = this.createForm.getRawValue();
    return Boolean(confirmPassword) && password !== confirmPassword;
  }

  selectUser(user: SupportUser): void {
    if (this.createForm.dirty) {
      this.pendingDiscardUser.set(user);
      return;
    }
    this.applyUserSelection(user);
  }

  openCreateWorkspace(): void {
    this.selected.set(null);
    this.activeWorkspace.set('detail');
  }

  backToList(): void {
    this.activeWorkspace.set('list');
  }

  clearSelection(): void {
    this.selected.set(null);
    this.activeWorkspace.set(this.isMobile() || this.isTablet() ? 'detail' : 'list');
  }

  requestNavigation(url: string): void {
    if (this.createForm.dirty) {
      this.pendingNavigationUrl.set(url);
      return;
    }
    this.router.navigateByUrl(url);
  }

  confirmDiscardCreation(): void {
    const user = this.pendingDiscardUser();
    const url = this.pendingNavigationUrl();
    this.createForm.reset();
    this.formSubmitted.set(false);
    this.pendingDiscardUser.set(null);
    this.pendingNavigationUrl.set(null);
    if (user) this.applyUserSelection(user);
    if (url) this.router.navigateByUrl(url);
  }

  cancelDiscardCreation(): void {
    this.pendingDiscardUser.set(null);
    this.pendingNavigationUrl.set(null);
  }

  logout(): void {
    this.auth.clearSession();
    this.router.navigateByUrl('/');
  }
  requestToggle(): void {
    if (this.selected() && !this.isSelf(this.selected()!)) this.pendingToggle.set(true);
  }
  requestRoleChange(): void {
    const user = this.selected();
    if (user && !this.isSelf(user)) {
      this.selectedRole.set(user.role === 'SUPERVISOR' ? 'SUPPORT' : 'SUPERVISOR');
      this.pendingRole.set(true);
    }
  }
  changeRole(): void {
    const user = this.selected();
    if (user)
      this.service.update(user.id, { role: this.selectedRole() }).subscribe({
        next: (updated) => {
          this.selected.set(updated);
          this.pendingRole.set(false);
          this.showAlert('Support user role updated successfully.', 'success');
          this.load();
        },
        error: (error) => this.showAlert(this.updateErrorMessage(error), 'error'),
      });
  }
  toggleActive(): void {
    const u = this.selected();
    if (u)
      this.service.update(u.id, { is_active: !u.is_active }).subscribe({
        next: (x) => {
          this.selected.set(x);
          this.pendingToggle.set(false);
          this.showAlert('Support user access status updated successfully.', 'success');
          this.load();
        },
        error: (error) => this.showAlert(this.updateErrorMessage(error), 'error'),
      });
  }

  private showAlert(message: string, variant: AlertVariant): void {
    this.alert.set({ message, variant });
  }

  private createErrorMessage(error: unknown): string {
    if (this.isDuplicateEmailError(error)) {
      return 'A support user with this email already exists.';
    }
    return 'Unable to create the support user.';
  }

  private updateErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 409) {
      return 'This update conflicts with an existing support user.';
    }
    return 'Unable to update the support user.';
  }

  private isDuplicateEmailError(error: unknown): boolean {
    if (!(error instanceof HttpErrorResponse)) return false;
    if (error.status === 409) return true;
    const detail = typeof error.error?.detail === 'string' ? error.error.detail : JSON.stringify(error.error ?? '');
    return /email.*(already|exists|duplicate)|(?:already|exists|duplicate).*email/i.test(detail);
  }

  private applyUserSelection(user: SupportUser): void {
    this.selected.set(user);
    this.activeWorkspace.set('detail');
  }
}
