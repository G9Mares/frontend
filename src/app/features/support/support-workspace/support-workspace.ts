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
  readonly canChangeStatus = computed(() => {
    const role = this.currentUser().role;
    return role === SupportUserRole.ADMIN || role === SupportUserRole.SUPERVISOR;
  });
  readonly canAddComment = this.canChangeStatus;
  readonly canUploadEvidence = this.canChangeStatus;
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
  selectTicket(ticket: Ticket): void { this.selectedTicket.set(ticket); this.ticketActionForm.controls.status.setValue(String(ticket.status)); this.mobileDetailOpen.set(true); }
  selectAuditLog(log: AuditLog): void { this.selectedAuditLog.set(log); this.mobileDetailOpen.set(true); }
  closeMobileDetail(): void { this.mobileDetailOpen.set(false); }
  goToTickets(): void { this.router.navigateByUrl('/tickets'); }
  goToHistory(): void { this.router.navigateByUrl('/history'); }
  logout(): void { this.authService.clearSession(); this.router.navigateByUrl('/'); }
  updateTicketStatus(): void {
    const ticket = this.selectedTicket(); if (!ticket || !this.canChangeStatus()) return;
    const status = Number(this.ticketActionForm.controls.status.value) as TicketStatus;
    if (this.currentUser().role === SupportUserRole.SUPERVISOR && status === TicketStatus.DELETED) { this.ticketActionAlert.set('Supervisors cannot mark a ticket deleted.'); return; }
    this.ticketService.updateTicketStatus(ticket.id, status).subscribe({ next: (updated) => { this.selectedTicket.set(updated); this.ticketActionAlert.set('Ticket status updated.'); this.loadTickets(); } });
  }
  submitComment(): void { if (this.canAddComment() && this.ticketActionForm.controls.comment.value.trim()) { this.ticketActionAlert.set('Comment saved in the provisional mock workspace.'); this.ticketActionForm.controls.comment.reset(); } }
  markTicketDeleted(): void { const ticket = this.selectedTicket(); if (ticket && this.canDelete()) { this.ticketService.updateTicketStatus(ticket.id, TicketStatus.DELETED).subscribe({ next: (updated) => { this.selectedTicket.set(updated); this.ticketActionAlert.set('Ticket marked deleted.'); this.loadTickets(); } }); } }
  ticketFilterChips(): Array<{ key: string; label: string }> { const values = this.ticketFiltersForm.getRawValue(); return Object.entries(values).filter(([, value]) => value).map(([key, value]) => ({ key, label: `${key}: ${value}` })); }
  historyFilterChips(): Array<{ key: string; label: string }> { const values = this.historyFiltersForm.getRawValue(); return Object.entries(values).filter(([, value]) => value).map(([key, value]) => ({ key, label: `${key}: ${value}` })); }
  removeTicketFilter(key: string): void { this.ticketFiltersForm.get(key)?.reset(); this.applyTicketFilters(); }
  removeHistoryFilter(key: string): void { this.historyFiltersForm.get(key)?.reset(); this.applyHistoryFilters(); }
  changeTicketPage(delta: number): void { this.ticketPage.update((page) => Math.max(1, page + delta)); this.loadTickets(); }
  changeHistoryPage(delta: number): void { this.historyPage.update((page) => Math.max(1, page + delta)); this.loadHistory(); }
  changeTicketPageSize(event: Event): void { this.ticketPageSize.set(Number((event.target as HTMLSelectElement).value)); this.ticketPage.set(1); this.loadTickets(); }
  changeHistoryPageSize(event: Event): void { this.historyPageSize.set(Number((event.target as HTMLSelectElement).value)); this.historyPage.set(1); this.loadHistory(); }
  actorName(log: AuditLog): string { return this.auditLogService.actorName(log); }
  statusLabel(ticket: Ticket): string { return ticket.status === TicketStatus.OPEN ? 'Open' : 'Deleted'; }
}
