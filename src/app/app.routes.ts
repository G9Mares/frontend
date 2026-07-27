import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/auth/landing-page/landing-page';
import { RoutePlaceholderComponent } from './shared/components/route-placeholder/route-placeholder';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
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
