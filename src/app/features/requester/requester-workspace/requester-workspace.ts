import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { TicketStatus } from '../../../core/enums/ticket-status.enum';
import { Area } from '../../../core/models/area.model';
import { Ticket, TicketAttachmentSummary } from '../../../core/models/ticket.model';
import { AreaService } from '../../../core/services/area.service';
import { AttachmentService } from '../../../core/services/attachment.service';
import { RequesterService } from '../../../core/services/requester.service';
import { TicketService } from '../../../core/services/ticket.service';

type MobileRequesterView = 'newTicket' | 'tickets' | 'detail';
type TabletRequesterView = 'workspace' | 'tickets';

@Component({
  selector: 'app-requester-workspace',
  imports: [NgTemplateOutlet, ReactiveFormsModule],
  templateUrl: './requester-workspace.html',
  styleUrl: './requester-workspace.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequesterWorkspaceComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly requesterService = inject(RequesterService);
  private readonly ticketService = inject(TicketService);
  private readonly areaService = inject(AreaService);
  private readonly attachmentService = inject(AttachmentService);
  private readonly destroyRef = inject(DestroyRef);

  readonly requesterSessionForm = this.formBuilder.nonNullable.group({
    requesterId: ['', [Validators.required]],
  });
  readonly ticketSearchForm = this.formBuilder.nonNullable.group({
    ticketId: ['', [Validators.required]],
  });
  readonly newTicketForm = this.formBuilder.nonNullable.group({
    areaId: ['', [Validators.required]],
    subject: ['', [Validators.required]],
    description: ['', [Validators.required]],
  });

  readonly activeRequester = this.requesterService.activeRequester;
  readonly selectedTicket = this.ticketService.selectedTicket;
  readonly tickets = signal<Ticket[]>([]);
  readonly areas = signal<Area[]>([]);
  readonly attachments = signal<TicketAttachmentSummary[]>([]);
  readonly selectedFiles = signal<File[]>([]);
  readonly workspaceLoading = signal(true);
  readonly ticketListLoading = signal(false);
  readonly ticketDetailLoading = signal(false);
  readonly ticketCreationLoading = signal(false);
  readonly ticketSubmissionStage = signal<'creating' | 'uploading' | null>(null);
  readonly requesterSessionLoading = signal(false);
  readonly ticketSearchLoading = signal(false);
  readonly requesterSessionAlert = signal<string | null>(null);
  readonly ticketSearchAlert = signal<string | null>(null);
  readonly newTicketAlert = signal<string | null>(null);
  readonly sessionChangedAlertVisible = signal(false);
  readonly requesterSessionChangeError = signal<string | null>(null);
  readonly mobileDrawerOpen = signal(false);
  readonly mobileView = signal<MobileRequesterView>('newTicket');
  readonly tabletView = signal<TabletRequesterView>('workspace');
  readonly viewportWidth = signal(typeof window === 'undefined' ? 1024 : window.innerWidth);
  readonly isMobile = computed(() => this.viewportWidth() < 768);
  readonly isDesktop = computed(() => this.viewportWidth() >= 1024);

  constructor() {
    this.areaService
      .getActiveAreas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (areas) => this.areas.set(areas),
        error: () => this.newTicketAlert.set('Unable to load active areas. Please try again.'),
      });

    const pendingTicketId = this.ticketService.requestedTicketId();

    if (pendingTicketId) {
      this.ticketService.setRequestedTicketId(null);
      this.openTicketById(pendingTicketId, false);
      return;
    }

    const requesterId = this.requesterService.activeRequesterId();

    if (requesterId) {
      this.loadRequesterSession(requesterId);
      return;
    }

    this.workspaceLoading.set(false);
    this.requesterSessionAlert.set('Enter a requester ID to start a requester session.');
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.viewportWidth.set(window.innerWidth);
  }

  changeRequesterSession(): void {
    this.requesterSessionAlert.set(null);

    if (this.requesterSessionForm.invalid) {
      this.requesterSessionForm.controls.requesterId.markAsTouched();
      this.requesterSessionAlert.set('Enter a requester ID.');
      return;
    }

    this.requesterSessionLoading.set(true);
    this.loadRequesterSession(this.requesterSessionForm.controls.requesterId.value.trim());
  }

  searchTicket(): void {
    this.ticketSearchAlert.set(null);

    if (this.ticketSearchForm.invalid) {
      this.ticketSearchForm.controls.ticketId.markAsTouched();
      this.ticketSearchAlert.set('Enter a ticket ID.');
      return;
    }

    this.ticketSearchLoading.set(true);
    this.openTicketById(this.ticketSearchForm.controls.ticketId.value.trim(), true);
  }

  selectTicket(ticket: Ticket): void {
    this.ticketService.selectTicket(ticket);
    this.tabletView.set('workspace');
    this.mobileView.set('detail');
    this.loadTicketAttachments(ticket.id);
  }

  returnToNewTicketForm(): void {
    this.ticketService.selectTicket(null);
    this.attachments.set([]);
    this.selectedFiles.set([]);
    this.resetNewTicketForm();
    this.mobileView.set('newTicket');
    this.tabletView.set('workspace');
  }

  openTabletTicketList(): void {
    this.tabletView.set('tickets');
    this.ticketService.selectTicket(null);
  }

  openMobileNewTicket(): void {
    this.mobileView.set('newTicket');
    this.ticketService.selectTicket(null);
  }

  openMobileTicketList(): void {
    this.mobileView.set('tickets');
    this.ticketService.selectTicket(null);
  }

  openMobileDrawer(): void {
    this.mobileDrawerOpen.set(true);
  }

  closeMobileDrawer(): void {
    this.mobileDrawerOpen.set(false);
  }

  createTicket(): void {
    this.newTicketAlert.set(null);

    if (!this.activeRequester()) {
      this.newTicketAlert.set('Start a requester session before creating a ticket.');
      return;
    }

    if (this.newTicketForm.invalid) {
      this.newTicketForm.markAllAsTouched();
      this.newTicketAlert.set('Complete the area, subject, and description fields.');
      return;
    }

    this.ticketCreationLoading.set(true);
    this.ticketSubmissionStage.set('creating');
    this.newTicketForm.disable({ emitEvent: false });
    const formValue = this.newTicketForm.getRawValue();
    const files = this.selectedFiles();

    this.ticketService
      .createTicket({
        requester_id: this.activeRequester()!.id,
        area_id: formValue.areaId,
        subject: formValue.subject,
        description: formValue.description,
      })
      .subscribe({
        next: (ticket) => {
          if (files.length === 0) {
            this.completeTicketSubmission('Ticket created successfully.');
            return;
          }
          this.ticketSubmissionStage.set('uploading');
          this.attachmentService.uploadAttachments(ticket.id, files).subscribe({
            next: (attachments) => this.completeTicketSubmission(`Ticket created with ${attachments.length} attachment(s).`),
            error: () => this.completeTicketSubmission('Ticket was created, but the attachments could not be uploaded.'),
          });
        },
        error: () => {
          this.ticketCreationLoading.set(false);
          this.ticketSubmissionStage.set(null);
          this.newTicketForm.enable({ emitEvent: false });
          this.newTicketAlert.set('Unable to create the ticket. Please try again.');
        },
      });
  }

  selectAttachmentFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    if (files.length > 3) {
      this.selectedFiles.set([]);
      this.newTicketAlert.set('Select no more than three attachments.');
      input.value = '';
      return;
    }

    const invalidFile = files.find(
      (file) =>
        !['image/jpeg', 'image/png', 'application/pdf'].includes(file.type) ||
        file.size > 5 * 1024 * 1024,
    );

    if (invalidFile) {
      this.selectedFiles.set([]);
      this.newTicketAlert.set('Attachments must be JPG, PNG, or PDF files no larger than 5 MB.');
      input.value = '';
      return;
    }

    this.selectedFiles.set(files);
  }


  dismissRequesterSessionAlert(): void {
    this.requesterSessionAlert.set(null);
  }

  dismissTicketSearchAlert(): void {
    this.ticketSearchAlert.set(null);
  }

  dismissNewTicketAlert(): void {
    this.newTicketAlert.set(null);
  }

  dismissSessionChangedAlert(): void {
    this.sessionChangedAlertVisible.set(false);
  }

  dismissSessionChangeError(): void {
    this.requesterSessionChangeError.set(null);
  }

  formatStatus(ticket: Ticket): string {
    if (ticket.status === TicketStatus.OPEN) return 'Open';
    if (ticket.status === TicketStatus.CLOSED) return 'Closed';
    if (ticket.status === TicketStatus.OUT_OF_SCOPE) return 'Out of Scope';
    return 'Deleted';
  }

  private openTicketById(ticketId: string, showSearchAlert: boolean): void {
    this.ticketService.lookupTicket(ticketId).subscribe({
      next: (ticket) => {
        const activeRequester = this.activeRequester();
        const activeRequesterId = activeRequester?.id ?? this.requesterService.activeRequesterId();

        if (!activeRequester || ticket.requester.id !== activeRequesterId) {
          this.loadRequesterSession(ticket.requester.id, ticket, true);
          return;
        }

        this.selectTicket(ticket);
        this.workspaceLoading.set(false);
        this.ticketListLoading.set(false);
      },
      error: () => {
        this.workspaceLoading.set(false);
        this.ticketListLoading.set(false);
        this.ticketSearchLoading.set(false);
        if (showSearchAlert) {
          this.ticketSearchAlert.set('Unable to find the ticket. Please try again.');
        }
      },
      complete: () => this.ticketSearchLoading.set(false),
    });
  }

  private loadRequesterSession(
    requesterId: string,
    selectedTicket: Ticket | null = null,
    showChangedAlert = false,
  ): void {
    this.workspaceLoading.set(true);
    this.ticketListLoading.set(true);
    this.requesterSessionChangeError.set(null);

    forkJoin({
      requester: this.requesterService.getRequester(requesterId),
      tickets: this.ticketService.getRequesterTickets(requesterId),
    }).subscribe({
      next: ({ requester, tickets }) => {
        this.requesterService.useRequesterId(requester.id);
        this.requesterService.setActiveRequester(requester);
        this.requesterSessionForm.controls.requesterId.setValue(requester.id, { emitEvent: false });
        this.tickets.set(tickets);
        this.newTicketForm.enable({ emitEvent: false });
        this.newTicketForm.reset({ areaId: '', subject: '', description: '' }, { emitEvent: false });

        if (selectedTicket) {
          this.tickets.update((currentTickets) =>
            currentTickets.some((ticket) => ticket.id === selectedTicket.id)
              ? currentTickets
              : [selectedTicket, ...currentTickets],
          );
          this.selectTicket(selectedTicket);
        } else {
          this.ticketService.selectTicket(null);
          this.mobileView.set('newTicket');
          this.tabletView.set('workspace');
        }

        if (showChangedAlert) {
          this.sessionChangedAlertVisible.set(true);
          setTimeout(() => this.sessionChangedAlertVisible.set(false), 4500);
        }
      },
      error: () => {
        this.workspaceLoading.set(false);
        this.ticketListLoading.set(false);
        this.requesterSessionLoading.set(false);
        this.ticketSearchLoading.set(false);
        this.requesterSessionChangeError.set('Unable to load the requester session. The current session was not changed.');
      },
      complete: () => {
        this.workspaceLoading.set(false);
        this.ticketListLoading.set(false);
        this.requesterSessionLoading.set(false);
        this.ticketSearchLoading.set(false);
      },
    });
  }

  private loadTicketAttachments(ticketId: string): void {
    this.ticketDetailLoading.set(true);
    const ticket = this.selectedTicket();
    this.attachments.set(ticket?.id === ticketId ? ticket.attachments : []);
    this.ticketDetailLoading.set(false);
  }

  private resetNewTicketForm(): void {
    this.newTicketForm.enable({ emitEvent: false });
    this.newTicketForm.reset({ areaId: '', subject: '', description: '' }, { emitEvent: false });
  }

  private completeTicketSubmission(message: string): void {
    this.selectedFiles.set([]);
    this.resetNewTicketForm();
    this.ticketCreationLoading.set(false);
    this.ticketSubmissionStage.set(null);
    const requesterId = this.activeRequester()?.id;
    if (!requesterId) {
      this.newTicketAlert.set(message);
      return;
    }
    this.ticketListLoading.set(true);
    this.ticketService.getRequesterTickets(requesterId).subscribe({
      next: (tickets) => {
        this.tickets.set(tickets);
        this.newTicketAlert.set(message);
      },
      error: () => this.newTicketAlert.set(`${message} Ticket list could not be refreshed.`),
      complete: () => this.ticketListLoading.set(false),
    });
  }
}
