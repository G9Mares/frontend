import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({ selector: 'app-status-badge', template: '<span class="rounded-control px-2 py-1 text-xs font-medium" [class.bg-success]="tone() === \'success\'" [class.bg-error]="tone() === \'error\'" [class.text-text-inverse]="tone() === \'success\' || tone() === \'error\'">{{ label() }}</span>', changeDetection: ChangeDetectionStrategy.OnPush })
export class StatusBadgeComponent {
  readonly label = input.required<string>();
  readonly tone = input<'success' | 'error'>('success');
}
