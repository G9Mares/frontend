import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({ selector: 'app-alert', templateUrl: './app-alert.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class AppAlertComponent {
  readonly alertId = input.required<string>();
  readonly message = input.required<string>();
  readonly variant = input<'error' | 'info' | 'success' | 'warning'>('info');
  readonly dismissed = output<void>();
}
