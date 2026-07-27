import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RequesterService } from '../../../core/services/requester.service';
import { TicketService } from '../../../core/services/ticket.service';

type RequesterEntrySection = 'registration' | 'requesterId' | 'ticketId' | null;

@Component({
  selector: 'app-landing-page',
  imports: [ReactiveFormsModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly requesterService = inject(RequesterService);
  private readonly ticketService = inject(TicketService);
  private readonly destroyRef = inject(DestroyRef);

  readonly supportLoginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  readonly requesterEntryForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    requesterId: ['', [Validators.required]],
    ticketId: ['', [Validators.required]],
  });

  readonly hasStoredSupportSession = signal(this.authService.hasStoredToken());
  readonly supportLoginLoading = signal(false);
  readonly requesterEntryLoading = signal(false);
  readonly supportLoginAlert = signal<string | null>(null);
  readonly requesterEntryAlert = signal<string | null>(null);
  readonly activeRequesterSection = signal<RequesterEntrySection>(null);
  readonly requesterContinueLabel = computed(() => {
    const activeSection = this.activeRequesterSection();

    if (activeSection === 'registration') {
      return 'Register and continue';
    }

    if (activeSection === 'ticketId') {
      return 'Find ticket and continue';
    }

    return 'Continue';
  });

  constructor() {
    const storedRequesterId = localStorage.getItem('requester_id');

    if (storedRequesterId) {
      this.requesterEntryForm.controls.requesterId.setValue(storedRequesterId, { emitEvent: false });
    }

    this.syncRequesterSections();

    this.requesterEntryForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncRequesterSections());
  }

  submitSupportLogin(): void {
    this.supportLoginAlert.set(null);

    if (this.supportLoginForm.invalid) {
      this.supportLoginForm.markAllAsTouched();
      this.supportLoginAlert.set('Enter a valid email and password.');
      return;
    }

    this.supportLoginLoading.set(true);
    this.authService.login(this.supportLoginForm.getRawValue()).subscribe({
      next: (response) => {
        this.authService.persistSession(response);
        this.hasStoredSupportSession.set(true);
        this.router.navigateByUrl('/tickets');
      },
      error: () => {
        this.supportLoginLoading.set(false);
        this.supportLoginAlert.set('Invalid email or password.');
      },
      complete: () => this.supportLoginLoading.set(false),
    });
  }

  continueSupportSession(): void {
    this.router.navigateByUrl('/tickets');
  }

  submitRequesterEntry(): void {
    this.requesterEntryAlert.set(null);
    const activeSection = this.activeRequesterSection();

    if (!activeSection) {
      this.requesterEntryAlert.set('Enter requester details, a requester ID, or a ticket ID.');
      return;
    }

    if (activeSection === 'registration') {
      this.registerRequester();
      return;
    }

    if (activeSection === 'requesterId') {
      this.useExistingRequester();
      return;
    }

    this.lookupTicket();
  }

  dismissSupportLoginAlert(): void {
    this.supportLoginAlert.set(null);
  }

  dismissRequesterEntryAlert(): void {
    this.requesterEntryAlert.set(null);
  }

  private registerRequester(): void {
    const registrationControls = this.requesterEntryForm.controls;

    if (
      registrationControls.name.invalid ||
      registrationControls.email.invalid ||
      registrationControls.phone.invalid
    ) {
      registrationControls.name.markAsTouched();
      registrationControls.email.markAsTouched();
      registrationControls.phone.markAsTouched();
      this.requesterEntryAlert.set('Complete the requester registration fields.');
      return;
    }

    this.requesterEntryLoading.set(true);
    this.requesterService
      .register({
        name: registrationControls.name.value,
        email: registrationControls.email.value,
        phone: registrationControls.phone.value,
      })
      .subscribe({
        next: (requester) => {
          this.requesterService.useRequesterId(requester.id);
          this.router.navigateByUrl('/requester_panel');
        },
        error: () => {
          this.requesterEntryLoading.set(false);
          this.requesterEntryAlert.set('Unable to register the requester. Please try again.');
        },
        complete: () => this.requesterEntryLoading.set(false),
      });
  }

  private useExistingRequester(): void {
    const requesterIdControl = this.requesterEntryForm.controls.requesterId;

    if (requesterIdControl.invalid) {
      requesterIdControl.markAsTouched();
      this.requesterEntryAlert.set('Enter a requester ID.');
      return;
    }

    this.requesterService.useRequesterId(requesterIdControl.value.trim());
    this.router.navigateByUrl('/requester_panel');
  }

  private lookupTicket(): void {
    const ticketIdControl = this.requesterEntryForm.controls.ticketId;

    if (ticketIdControl.invalid) {
      ticketIdControl.markAsTouched();
      this.requesterEntryAlert.set('Enter a ticket ID.');
      return;
    }

    this.requesterEntryLoading.set(true);
    this.ticketService.lookupTicket(ticketIdControl.value.trim()).subscribe({
      next: (session) => {
        this.requesterService.useRequesterId(session.requesterId);
        this.ticketService.setRequestedTicketId(session.ticketId);
        this.router.navigateByUrl('/requester_panel');
      },
      error: () => {
        this.requesterEntryLoading.set(false);
        this.requesterEntryAlert.set('Unable to find the ticket. Please try again.');
      },
      complete: () => this.requesterEntryLoading.set(false),
    });
  }

  private syncRequesterSections(): void {
    const controls = this.requesterEntryForm.controls;
    const registrationHasValue = [controls.name.value, controls.email.value, controls.phone.value].some(
      (value) => value.trim().length > 0,
    );
    const requesterIdHasValue = controls.requesterId.value.trim().length > 0;
    const ticketIdHasValue = controls.ticketId.value.trim().length > 0;
    const activeSection: RequesterEntrySection = registrationHasValue
      ? 'registration'
      : requesterIdHasValue
        ? 'requesterId'
        : ticketIdHasValue
          ? 'ticketId'
          : null;

    this.activeRequesterSection.set(activeSection);
    this.setSectionDisabledState(activeSection);
  }

  private setSectionDisabledState(activeSection: RequesterEntrySection): void {
    const controls = this.requesterEntryForm.controls;
    const sectionControls: Record<Exclude<RequesterEntrySection, null>, Array<keyof typeof controls>> = {
      registration: ['name', 'email', 'phone'],
      requesterId: ['requesterId'],
      ticketId: ['ticketId'],
    };

    Object.entries(sectionControls).forEach(([section, controlNames]) => {
      const shouldDisable = activeSection !== null && activeSection !== section;

      controlNames.forEach((controlName) => {
        const control = controls[controlName];

        if (shouldDisable && control.enabled) {
          control.disable({ emitEvent: false });
        }

        if (!shouldDisable && control.disabled) {
          control.enable({ emitEvent: false });
        }
      });
    });
  }
}
