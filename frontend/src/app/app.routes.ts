import { Routes } from '@angular/router';

import { EmailVerificationComponent, ResetPasswordConfirmationComponent } from '@auth/components/';
import { UserRole } from '@auth/types';

import { roleGuard } from '@core/guards/role.guard';

import { CountriesListComponent } from '@dictionaries/countries/pages';
import { DiseasesListComponent } from '@dictionaries/diseases/pages';
import { MedicinesListComponent } from '@dictionaries/medicines/pages';
import { OfficesListComponent } from '@dictionaries/offices/pages';
import { SpecializationsListComponent } from '@dictionaries/specializations/pages';

import { DashboardComponent, PageNotFoundComponent } from '@layout/components';
import { NoPermissionsComponent } from '@layout/components/no-permissions/no-permissions.component';

import { PrescriptionsListComponent } from '@prescriptions/pages';

import { DoctorsListComponent } from '@roles/doctors/pages';
import { NursesListComponent } from '@roles/nurses/pages';
import { PatientsListComponent } from '@roles/patients/pages';

import { VisitsListComponent } from '@visits/pages';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  {
    path: 'uzytkownicy',
    children: [
      {
        path: 'lekarze',
        component: DoctorsListComponent,
        canActivate: [roleGuard],
        data: { roles: [UserRole.NURSE, UserRole.DOCTOR, UserRole.ADMIN] }
      },
      {
        path: 'pacjenci',
        component: PatientsListComponent,
        canActivate: [roleGuard],
        data: { roles: [UserRole.NURSE, UserRole.DOCTOR, UserRole.ADMIN] }
      },
      {
        path: 'pielegniarki',
        component: NursesListComponent,
        canActivate: [roleGuard],
        data: { roles: [UserRole.DOCTOR, UserRole.ADMIN] }
      }
    ]
  },
  {
    path: 'slowniki',
    children: [
      {
        path: 'choroby',
        component: DiseasesListComponent,
        canActivate: [roleGuard],
        data: { roles: [UserRole.DOCTOR, UserRole.ADMIN] }
      },
      { path: 'kraje', component: CountriesListComponent },
      {
        path: 'leki',
        component: MedicinesListComponent,
        canActivate: [roleGuard],
        data: { roles: [UserRole.DOCTOR, UserRole.ADMIN] }
      },
      {
        path: 'gabinety',
        component: OfficesListComponent,
        canActivate: [roleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.PATIENT] }
      },
      {
        path: 'specjalizacje',
        component: SpecializationsListComponent,
        canActivate: [roleGuard],
        data: { roles: [UserRole.DOCTOR, UserRole.ADMIN] }
      },
      { path: '', redirectTo: '/', pathMatch: 'full' }
    ]
  },
  {
    path: 'wizyty',
    component: VisitsListComponent,
    canActivate: [roleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.PATIENT] }
  },
  {
    path: 'recepty',
    component: PrescriptionsListComponent,
    canActivate: [roleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT] }
  },
  {
    path: 'verify-email/:uidb64/:token',
    component: EmailVerificationComponent
  },
  {
    path: 'reset-password/:uidb64/:token',
    component: ResetPasswordConfirmationComponent
  },
  { path: 'no-permissions', component: NoPermissionsComponent },
  { path: '404', component: PageNotFoundComponent },
  { path: '**', redirectTo: '/404' }
];
