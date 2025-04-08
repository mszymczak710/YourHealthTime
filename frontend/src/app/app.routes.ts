import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import { UserRole } from '@auth/types';

import { ROLE_GUARD } from '@core/guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@layout/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'uzytkownicy',
    children: [
      {
        path: 'lekarze',
        loadComponent: () => import('@roles/doctors/pages/doctors-list/doctors-list.component').then(m => m.DoctorsListComponent),
        canActivate: [(route, state) => inject(ROLE_GUARD)(route, state)],
        data: { roles: [UserRole.NURSE, UserRole.DOCTOR, UserRole.ADMIN] }
      },
      {
        path: 'pacjenci',
        loadComponent: () => import('@roles/patients/pages/patients-list/patients-list.component').then(m => m.PatientsListComponent),
        canActivate: [(route, state) => inject(ROLE_GUARD)(route, state)],
        data: { roles: [UserRole.NURSE, UserRole.DOCTOR, UserRole.ADMIN] }
      },
      {
        path: 'pielegniarki',
        loadComponent: () => import('@roles/nurses/pages/nurses-list/nurses-list.component').then(m => m.NursesListComponent),
        canActivate: [(route, state) => inject(ROLE_GUARD)(route, state)],
        data: { roles: [UserRole.NURSE, UserRole.DOCTOR, UserRole.ADMIN] }
      }
    ]
  },
  {
    path: 'slowniki',
    children: [
      {
        path: 'choroby',
        loadComponent: () =>
          import('@dictionaries/diseases/pages/diseases-list/diseases-list.component').then(m => m.DiseasesListComponent),
        canActivate: [(route, state) => inject(ROLE_GUARD)(route, state)],
        data: { roles: [UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN] }
      },
      {
        path: 'kraje',
        loadComponent: () =>
          import('@dictionaries/countries/pages/countries-list/countries-list.component').then(m => m.CountriesListComponent)
      },
      {
        path: 'leki',
        loadComponent: () =>
          import('@dictionaries/medicines/pages/medicines-list/medicines-list.component').then(m => m.MedicinesListComponent),
        canActivate: [(route, state) => inject(ROLE_GUARD)(route, state)],
        data: { roles: [UserRole.DOCTOR, UserRole.ADMIN] }
      },
      {
        path: 'gabinety',
        loadComponent: () => import('@dictionaries/offices/pages/offices-list/offices-list.component').then(m => m.OfficesListComponent),
        canActivate: [(route, state) => inject(ROLE_GUARD)(route, state)],
        data: { roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.PATIENT] }
      },
      {
        path: 'specjalizacje',
        loadComponent: () =>
          import('@dictionaries/specializations/pages/specializations-list/specializations-list.component').then(
            m => m.SpecializationsListComponent
          ),
        canActivate: [(route, state) => inject(ROLE_GUARD)(route, state)],
        data: { roles: [UserRole.DOCTOR, UserRole.ADMIN] }
      },
      { path: '', redirectTo: '/', pathMatch: 'full' }
    ]
  },
  {
    path: 'wizyty',
    loadComponent: () => import('@visits/pages/visits-list/visits-list.component').then(m => m.VisitsListComponent),
    canActivate: [(route, state) => inject(ROLE_GUARD)(route, state)],
    data: { roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.PATIENT] }
  },
  {
    path: 'recepty',
    loadComponent: () =>
      import('@prescriptions/pages/prescriptions-list/prescriptions-list.component').then(m => m.PrescriptionsListComponent),
    canActivate: [(route, state) => inject(ROLE_GUARD)(route, state)],
    data: { roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT] }
  },
  {
    path: 'verify-email/:uidb64/:token',
    loadComponent: () => import('@auth/components/email-verification/email-verification.component').then(m => m.EmailVerificationComponent)
  },
  {
    path: 'reset-password/:uidb64/:token',
    loadComponent: () =>
      import('@auth/components/reset-password-confirmation/reset-password-confirmation.component').then(
        m => m.ResetPasswordConfirmationComponent
      )
  },
  {
    path: 'no-permissions',
    loadComponent: () => import('@layout/components/no-permissions/no-permissions.component').then(m => m.NoPermissionsComponent)
  },
  {
    path: '404',
    loadComponent: () => import('@layout/components/page-not-found/page-not-found.component').then(m => m.PageNotFoundComponent)
  },
  { path: '**', redirectTo: '/404' }
];
