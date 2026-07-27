import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { SupportUserRole } from '../enums/support-user-role.enum';
import { AuthService } from '../services/auth.service';

export const adminRoleGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.restoreSession().pipe(map((user) => user.role === SupportUserRole.ADMIN || router.createUrlTree(['/tickets'])));
};
