import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({ selector: 'app-pagination', templateUrl: './pagination.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class PaginationComponent {
  readonly containerId = input.required<string>();
  readonly previousId = input.required<string>();
  readonly nextId = input.required<string>();
  readonly pageSizeId = input.required<string>();
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly itemCount = input.required<number>();
  readonly previous = output<void>();
  readonly next = output<void>();
  readonly pageSizeChanged = output<number>();
}
