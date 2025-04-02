import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, LOCALE_ID } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

import { provideToastr } from 'ngx-toastr';

import { AuthInterceptor } from '@auth/interceptors';
import { AuthFacade } from '@auth/services';

import { ROLE_GUARD, roleGuard } from '@core/guards';
import { initializeApp } from '@core/initializers';
import { CUSTOM_DATE_FORMATS } from '@core/misc';

import { MatPaginatorIntlPl } from '@shared/shared-table/misc';

import { routes } from './app.routes';
import { HttpErrorInterceptor } from './core/interceptors';
import { IconsRegistryService, ToastService } from './core/services';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'pl-PL' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    provideRouter(routes),
    provideToastr({
      timeOut: 3000,
      preventDuplicates: true
    }),
    IconsRegistryService,
    ToastService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: ROLE_GUARD,
      useValue: roleGuard
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    { provide: LOCALE_ID, useValue: 'pl-PL' },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlPl },
    {
      deps: [AuthFacade, IconsRegistryService],
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      multi: true
    }
  ]
};
