import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { Subject, takeUntil } from 'rxjs';

import { AuthFacade } from '@auth/services';
import { UserAuthData, UserRole } from '@auth/types';

import { PermissionStructuralDirective } from '@core/directives';

import {
  PatientDashboardComponent,
  AnonymousDashboardComponent,
  AdminDashboardComponent,
  DoctorDashboardComponent,
  NurseDashboardComponent
} from '@layout/components/dashboards';

@Component({
  selector: 'yht-dashboard',
  standalone: true,
  imports: [
    AdminDashboardComponent,
    AnonymousDashboardComponent,
    DoctorDashboardComponent,
    NurseDashboardComponent,
    PatientDashboardComponent,
    PermissionStructuralDirective
  ],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  user: UserAuthData;
  userRole = UserRole;

  constructor(
    private authFacade: AuthFacade,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initUserSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initUserSubscription(): void {
    this.authFacade.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.user = user;
      this.cdr.markForCheck();
    });
  }
}
