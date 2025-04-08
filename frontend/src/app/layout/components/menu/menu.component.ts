import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';
import { UserAuthData, UserRole } from 'src/app/auth/types';
import { PermissionStructuralDirective } from 'src/app/core/directives';

import { LoginResetPasswordDialogComponent, RegisterFormComponent } from '@auth/components';
import { AuthFacade } from '@auth/services';

import { ClassExtender } from '@core/misc';

import { UserInfoComponent } from '@layout/components/user-info/user-info.component';
import { StringsLoader } from '@layout/misc';
import { MenuService } from '@layout/services';
import { MenuItem } from '@layout/types';

export interface MenuComponent extends StringsLoader {}

@Component({
  selector: 'yht-menu',
  standalone: true,
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltipModule,
    PermissionStructuralDirective,
    RouterModule,
    UserInfoComponent
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  providers: [MenuService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class MenuComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  user: UserAuthData;
  userRole = UserRole;

  menuConfig: MenuItem[];

  constructor(
    private authFacade: AuthFacade,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    this.prepareMenuConfig();
    this.initUserSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private prepareMenuConfig(): void {
    this.menuConfig = [
      ...this.menuService.getMenuConfig(),
      {
        label: this.strings.menu.actions.login,
        action: () => this.openLoginForm(),
        roles: []
      },
      {
        label: this.strings.menu.actions.register,
        action: () => this.openRegisterForm(),
        roles: []
      }
    ];
  }

  private openLoginForm(): void {
    this.dialog.open(LoginResetPasswordDialogComponent);
  }

  private openRegisterForm(): void {
    this.dialog.open(RegisterFormComponent);
  }

  private initUserSubscription(): void {
    this.authFacade.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.user = user;
      this.cdr.markForCheck();
    });
  }
}
