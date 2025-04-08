import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { ChangePasswordFormComponent, LogoutConfirmDialogComponent } from '@auth/components';
import { UserAuthData, UserRole } from '@auth/types';

import { PermissionStructuralDirective } from '@core/directives';
import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@layout/misc';
import { MenuItem } from '@layout/types';

export interface UserInfoComponent extends StringsLoader {}

@Component({
  selector: 'yht-user-info',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatMenuModule, PermissionStructuralDirective],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class UserInfoComponent implements OnInit {
  @Input() user: UserAuthData;

  userMenuConfig: MenuItem[];

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.prepareMenuConfig();
  }

  private prepareMenuConfig(): void {
    this.userMenuConfig = [
      {
        label: this.strings.menu.actions.changePassword,
        action: () => this.openChangePasswordForm(),
        roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.PATIENT]
      },
      {
        label: this.strings.menu.actions.logout,
        action: () => this.openLogoutConfirmDialog(),
        roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.PATIENT]
      }
    ];
  }

  private openChangePasswordForm(): void {
    this.dialog.open(ChangePasswordFormComponent);
  }

  private openLogoutConfirmDialog(): void {
    this.dialog.open(LogoutConfirmDialogComponent);
  }
}
