import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, catchError, throwError } from 'rxjs';

import { commonStrings } from '@core/misc';
import { ToastService } from '@core/services';
import { HttpErrorStatus } from '@core/types';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  httpErrorStrings = commonStrings.errors.http;

  constructor(private injector: Injector) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const router = this.injector.get(Router);
        const toastService = this.injector.get(ToastService);

        const errorMessage =
          this.httpErrorStrings[error.status as keyof typeof this.httpErrorStrings] || this.httpErrorStrings[HttpErrorStatus.BAD_REQUEST];

        toastService.showErrorMessage(errorMessage);

        if (error.status === HttpErrorStatus.NOT_FOUND) {
          setTimeout(() => router.navigate(['/404']), 500);
        }

        return throwError(() => error);
      })
    );
  }
}
