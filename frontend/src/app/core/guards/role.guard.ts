import { InjectionToken, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

import { AuthFacade } from '@auth/services';
import { UserRole } from '@auth/types';

export const ROLE_GUARD = new InjectionToken<CanActivateFn>('roleGuard');

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);
  const allowedRoles = route.data?.['roles'] as UserRole[] | undefined;

  // Jeśli brak wymaganych ról — brak sprawdzenia
  if (!allowedRoles) {
    return true;
  }

  const userRole = authFacade.getUserRole();

  // Jeśli użytkownik nie ma roli lub nie znajduje się wśród dozwolonych — przekierowanie
  if (!userRole || !allowedRoles.includes(userRole)) {
    router.navigate(['/no-permissions']);
    return false;
  }

  return true;
};
