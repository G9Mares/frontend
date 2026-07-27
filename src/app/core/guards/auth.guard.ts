import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.hasStoredToken()) return router.createUrlTree(['/']);
  return authService.restoreSession().pipe(map(() => true), catchError(() => { authService.clearSession(); return of(router.createUrlTree(['/'])); }));
};
