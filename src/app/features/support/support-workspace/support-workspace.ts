import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Area } from '../../../core/models/area.model';
import { AuditLog } from '../../../core/models/audit-log.model';
import { Ticket } from '../../../core/models/ticket.model';
import { SupportUserRole } from '../../../core/enums/support-user-role.enum';
import { TicketStatus } from '../../../core/enums/ticket-status.enum';
import { AreaService } from '../../../core/services/area.service';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { AuthService } from '../../../core/services/auth.service';
import { AttachmentService } from '../../../core/services/attachment.service';
import { TicketService } from '../../../core/services/ticket.service';
import { AppAlertComponent } from '../../../shared/components/app-alert/app-alert';

type SupportPage = 'tickets' | 'history';

@Component({
  selector: 'app-support-workspace',
  imports: [AppAlertComponent, JsonPipe, ReactiveFormsModule],
  templateUrl: './support-workspace.html',
  styleUrl: './support-workspace.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportWorkspaceComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly attachmentService = inject(AttachmentService);
  private readonly ticketService = inject(TicketService);
  private readonly auditLogService = inject(AuditLogService);
  private readonly areaService = inject(AreaService);

  readonly TicketStatus = TicketStatus;
  readonly SupportUserRole = SupportUserRole;
  readonly page = signal<SupportPage>(this.route.snapshot.routeConfig?.path === 'history' ? 'history' : 'tickets');
  readonly currentUser = signal(this.authService.getCurrentMockUser());
  readonly isTicketFiltersOpen = signal(false);
  readonly isHistoryFiltersOpen = signal(false);
  readonly mobileDrawerOpen = signal(false);
  readonly mobileFiltersOpen = signal(false);
  readonly mobileDetailOpen = signal(false);
  readonly viewportWidth = signal(typeof window === 'undefined' ? 1024 : window.innerWidth);
  readonly isMobile = computed(() => this.viewportWidth() < 768);
  readonly canViewHistory = computed(() => this.currentUser().role === SupportUserRole.ADMIN);
  readonly canManageSupportUsers = computed(() => this.currentUser().role === SupportUserRole.ADMIN);
  readonly canChangeStatus = computed(() => {
    const role = this.currentUser().role;
    return role === SupportUserRole.ADMIN || role === SupportUserRole.SUPERVISOR;
  });
  readonly canAddComment = this.canChangeStatus;
  readonly canDelete = computed(() => this.currentUser().role === SupportUserRole.ADMIN);

  readonly ticketFiltersForm = this.formBuilder.nonNullable.group({ ticketId: '', requesterId: '', status: '', areaId: '', dateFrom: '', dateTo: '' });
  readonly historyFiltersForm = this.formBuilder.nonNullable.group({ performedBy: '', action: '', entityType: '', entityId: '', dateFrom: '', dateTo: '' });
  readonly ticketActionForm = this.formBuilder.nonNullable.group({ status: '', comment: '' });
  readonly tickets = signal<Ticket[]>([]);
  readonly auditLogs = signal<AuditLog[]>([]);
  readonly areas = signal<Area[]>([]);
  readonly selectedTicket = signal<Ticket | null>(null);
  readonly selectedAuditLog = signal<AuditLog | null>(null);
  readonly ticketsLoading = signal(true);
  readonly historyLoading = signal(true);
  readonly ticketsError = signal<string | null>(null);
  readonly historyError = signal<string | null>(null);
  readonly ticketActionAlert = signal<string | null>(null);
  readonly ticketActionSaving = signal(false);
  readonly attachmentActionLoadingId = signal<string | null>(null);
  readonly ticketPage = signal(1);
  readonly ticketPageSize = signal(10);
  readonly ticketTotal = signal(0);
  readonly historyPage = signal(1);
  readonly historyPageSize = signal(10);
  readonly historyTotal = signal(0);

  constructor() {
    this.areaService.getActiveAreas().subscribe({ next: (areas) => this.areas.set(areas) });
    this.loadTickets();
    this.loadHistory();
  }

  @HostListener('window:resize') onWindowResize(): void { this.viewportWidth.set(window.innerWidth); }

  loadTickets(): void {
    this.ticketsLoading.set(true); this.ticketsError.set(null);
    const filters = this.ticketFiltersForm.getRawValue();
    this.ticketService.getSupportTickets({ ...filters, page: this.ticketPage(), pageSize: this.ticketPageSize() }).subscribe({
      next: (response) => { this.tickets.set(response.items); this.ticketTotal.set(response.pagination.total); this.ticketPage.set(response.pagination.page); if (this.selectedTicket() && !response.items.some((ticket) => ticket.id === this.selectedTicket()!.id)) this.selectedTicket.set(null); },
      error: () => { this.ticketsError.set('Unable to load tickets.'); this.ticketsLoading.set(false); },
      complete: () => this.ticketsLoading.set(false),
    });
  }

  loadHistory(): void {
    this.historyLoading.set(true); this.historyError.set(null);
    const filters = this.historyFiltersForm.getRawValue();
    this.auditLogService.getAuditLogs({ ...filters, page: this.historyPage(), pageSize: this.historyPageSize() }).subscribe({
      next: (response) => { this.auditLogs.set(response.items); this.historyTotal.set(response.pagination.total); this.historyPage.set(response.pagination.page); if (this.selectedAuditLog() && !response.items.some((log) => log.id === this.selectedAuditLog()!.id)) this.selectedAuditLog.set(null); },
      error: () => { this.historyError.set('Unable to load audit history.'); this.historyLoading.set(false); },
      complete: () => this.historyLoading.set(false),
    });
  }

  applyTicketFilters(): void { this.ticketPage.set(1); this.loadTickets(); this.mobileFiltersOpen.set(false); }
  clearTicketFilters(): void { this.ticketFiltersForm.reset(); this.ticketPage.set(1); this.loadTickets(); }
  applyHistoryFilters(): void { this.historyPage.set(1); this.loadHistory(); this.mobileFiltersOpen.set(false); }
  clearHistoryFilters(): void { this.historyFiltersForm.reset(); this.historyPage.set(1); this.loadHistory(); }
  selectTicket(ticket: Ticket): void { this.selectedTicket.set(ticket); this.ticketActionForm.reset({ status: String(ticket.status), comment: '' }); this.mobileDetailOpen.set(true); }
  selectAuditLog(log: AuditLog): void { this.selectedAuditLog.set(log); this.mobileDetailOpen.set(true); }
  closeMobileDetail(): void { this.mobileDetailOpen.set(false); }
  goToTickets(): void { this.router.navigateByUrl('/tickets'); }
  goToHistory(): void { this.router.navigateByUrl('/history'); }
  goToSupportUsers(): void { this.router.navigateByUrl('/support-users'); }
  logout(): void { this.authService.clearSession(); this.router.navigateByUrl('/'); }
  updateTicketStatus(): void {
    const ticket = this.selectedTicket(); if (!ticket || !this.canChangeStatus()) return;
    const status = Number(this.ticketActionForm.controls.status.value) as TicketStatus;
    if (this.currentUser().role === SupportUserRole.SUPERVISOR && (status === TicketStatus.DELETED || status === TicketStatus.OUT_OF_SCOPE)) { this.ticketActionAlert.set('Only administrators can mark a ticket as deleted or out of scope.'); return; }
    if (!this.ticketActionForm.controls.comment.value.trim()) { this.ticketActionAlert.set('A comment is required to change the ticket status.'); return; }
    this.saveTicketUpdate(ticket, status, this.ticketActionForm.controls.comment.value.trim(), 'Ticket status updated.');
  }
  submitComment(): void {
    const ticket = this.selectedTicket();
    const comment = this.ticketActionForm.controls.comment.value.trim();
    if (!ticket || !this.canAddComment()) return;
    if (!comment) { this.ticketActionAlert.set('Enter a comment before submitting it.'); return; }
    this.saveTicketUpdate(ticket, ticket.status, comment, 'Comment added.');
  }
  viewAttachment(ticketId: string, attachmentId: string): void {
    this.resolveAttachmentUrl(ticketId, attachmentId, (url) => {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    });
  }
  ticketFilterChips(): Array<{ key: string; label: string }> { const values = this.ticketFiltersForm.getRawValue(); return Object.entries(values).filter(([, value]) => value).map(([key, value]) => ({ key, label: `${key}: ${value}` })); }
  historyFilterChips(): Array<{ key: string; label: string }> { const values = this.historyFiltersForm.getRawValue(); return Object.entries(values).filter(([, value]) => value).map(([key, value]) => ({ key, label: `${key}: ${value}` })); }
  removeTicketFilter(key: string): void { this.ticketFiltersForm.get(key)?.reset(); this.applyTicketFilters(); }
  removeHistoryFilter(key: string): void { this.historyFiltersForm.get(key)?.reset(); this.applyHistoryFilters(); }
  changeTicketPage(delta: number): void { this.ticketPage.update((page) => Math.max(1, page + delta)); this.loadTickets(); }
  changeHistoryPage(delta: number): void { this.historyPage.update((page) => Math.max(1, page + delta)); this.loadHistory(); }
  changeTicketPageSize(event: Event): void { this.ticketPageSize.set(Number((event.target as HTMLSelectElement).value)); this.ticketPage.set(1); this.loadTickets(); }
  changeHistoryPageSize(event: Event): void { this.historyPageSize.set(Number((event.target as HTMLSelectElement).value)); this.historyPage.set(1); this.loadHistory(); }
  actorName(log: AuditLog): string { return this.auditLogService.actorName(log); }
  statusLabel(ticket: Ticket): string {
    if (ticket.status === TicketStatus.OPEN) return 'Open';
    if (ticket.status === TicketStatus.CLOSED) return 'Closed';
    if (ticket.status === TicketStatus.OUT_OF_SCOPE) return 'Out of Scope';
    return 'Deleted';
  }

  private saveTicketUpdate(ticket: Ticket, status: TicketStatus, comment: string, successMessage: string): void {
    this.ticketActionSaving.set(true);
    this.ticketService.updateTicketStatus(ticket.id, status, comment).subscribe({
      next: (updated) => {
        this.selectedTicket.set(updated);
        this.ticketActionForm.reset({ status: String(updated.status), comment: '' });
        this.ticketActionAlert.set(successMessage);
        this.loadTickets();
      },
      error: () => this.ticketActionAlert.set('Unable to update the ticket. Please try again.'),
      complete: () => this.ticketActionSaving.set(false),
    });
  }

  private resolveAttachmentUrl(ticketId: string, attachmentId: string, onSuccess: (url: string) => void): void {
    if (typeof document === 'undefined') return;
    this.attachmentActionLoadingId.set(attachmentId);
    this.attachmentService.getDownloadUrl(ticketId, attachmentId).subscribe({
      next: (response) => onSuccess(response.url),
      error: () => this.ticketActionAlert.set('Unable to access this attachment. Please try again.'),
      complete: () => this.attachmentActionLoadingId.set(null),
    });
  }
}
