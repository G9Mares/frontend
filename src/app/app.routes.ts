import { Routes } from '@angular/router';
import { RoutePlaceholderComponent } from './shared/components/route-placeholder/route-placeholder';

export const routes: Routes = [
  {
    path: '',
    component: RoutePlaceholderComponent,
    title: 'Support Ticket Management',
  },
  {
    path: 'requester_panel',
    component: RoutePlaceholderComponent,
    title: 'Requester Workspace',
  },
  {
    path: 'tickets',
    component: RoutePlaceholderComponent,
    title: 'Ticket Workspace',
  },
  {
    path: 'history',
    component: RoutePlaceholderComponent,
    title: 'Audit History',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
