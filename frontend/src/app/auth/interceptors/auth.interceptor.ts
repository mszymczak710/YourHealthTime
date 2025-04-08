import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, catchError, switchMap } from 'rxjs';

import { AuthFacade } from '@auth/services';

import { Endpoints } from '@core/misc';

import { environmentBase } from '@environments/environment-base';

import { SessionTimerService } from '@layout/services';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authFacade: AuthFacade,
    private sessionTimerService: SessionTimerService
  ) {}

  /**
   * Interceptor HTTP dodający nagłówek Authorization z access tokenem.
   * Jeśli token istnieje, dołącza go do każdego wychodzącego zapytania HTTP.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Pominięcie interceptowania requestu forceLogout (nie wymaga tokena)
    if (req.url.includes(Endpoints.urls.auth.forceLogout)) {
      return next.handle(req);
    }

    const accessToken = this.authFacade.getAccessToken();

    if (!accessToken) {
      return next.handle(req);
    }

    // Jeśli token zaraz wygaśnie następuje odświeżenie go
    if (this.shouldRefreshTokenSoon()) {
      return this.authFacade.refreshTokens().pipe(
        switchMap(() => {
          const newToken = this.authFacade.getAccessToken();
          const cloned = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` }
          });
          return next.handle(cloned);
        }),
        catchError(() => next.handle(req))
      );
    }

    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return next.handle(cloned);
  }

  /**
   * Sprawdza, czy access token powinien być odświeżony.
   */
  private shouldRefreshTokenSoon(): boolean {
    const secondsRemaining = this.sessionTimerService.getSecondsRemaining();
    return secondsRemaining !== null && secondsRemaining <= environmentBase.tokenExpiryBufferSeconds;
  }
}
