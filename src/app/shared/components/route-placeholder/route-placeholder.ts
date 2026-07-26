import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-route-placeholder',
  templateUrl: './route-placeholder.html',
  styleUrl: './route-placeholder.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutePlaceholderComponent {}
