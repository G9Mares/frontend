import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/auth/landing-page/landing-page';
import { RequesterWorkspaceComponent } from './features/requester/requester-workspace/requester-workspace';
import { SupportWorkspaceComponent } from './features/support/support-workspace/support-workspace';
import { SupportUsersComponent } from './features/support/support-users/support-users';
import { authGuard } from './core/guards/auth.guard';
import { adminRoleGuard } from './core/guards/admin-role.guard';
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
    canActivate: [authGuard],
    title: 'Ticket Workspace',
  },
  {
    path: 'history',
    component: SupportWorkspaceComponent,
    canActivate: [authGuard, adminRoleGuard],
    title: 'Audit History',
  },
  {
    path: 'support-users',
    component: SupportUsersComponent,
    canActivate: [authGuard, adminRoleGuard],
    title: 'Support Users',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
