import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/auth/landing-page/landing-page';
import { RequesterWorkspaceComponent } from './features/requester/requester-workspace/requester-workspace';
import { SupportWorkspaceComponent } from './features/support/support-workspace/support-workspace';
import { RoutePlaceholderComponent } from './shared/components/route-placeholder/route-placeholder';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    title: 'Support Ticket Management',
  },
  {
    path: 'requester_panel',
    component: RequesterWorkspaceComponent,
    title: 'Requester Workspace',
  },
  {
    path: 'tickets',
    component: SupportWorkspaceComponent,
    title: 'Ticket Workspace',
  },
  {
    path: 'history',
    component: SupportWorkspaceComponent,
    title: 'Audit History',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
