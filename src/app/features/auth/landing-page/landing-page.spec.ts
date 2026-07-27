import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LandingPageComponent } from './landing-page';

describe('LandingPageComponent', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [LandingPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should disable the other requester sections after entering registration data', () => {
    const fixture = TestBed.createComponent(LandingPageComponent);
    const component = fixture.componentInstance;

    component.requesterEntryForm.controls.name.setValue('Alex Requester');

    expect(component.activeRequesterSection()).toBe('registration');
    expect(component.requesterEntryForm.controls.requesterId.disabled).toBe(true);
    expect(component.requesterEntryForm.controls.ticketId.disabled).toBe(true);
  });

  it('should re-enable all requester sections after clearing the active section', () => {
    const fixture = TestBed.createComponent(LandingPageComponent);
    const component = fixture.componentInstance;

    component.requesterEntryForm.controls.requesterId.setValue('requester-id');
    component.requesterEntryForm.controls.requesterId.setValue('');

    expect(component.activeRequesterSection()).toBeNull();
    expect(component.requesterEntryForm.controls.name.enabled).toBe(true);
    expect(component.requesterEntryForm.controls.ticketId.enabled).toBe(true);
  });

  it('should detect a stored support token on load', () => {
    localStorage.setItem('support_access_token', 'stored-token');
    const fixture = TestBed.createComponent(LandingPageComponent);
    const component = fixture.componentInstance;

    expect(component.hasStoredSupportSession()).toBe(true);
  });
});
