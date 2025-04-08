import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { LoginResetPasswordDialogComponent, RegisterFormComponent } from '@auth/components';

import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@layout/misc';

export interface AnonymousDashboardComponent extends StringsLoader {}
@Component({
  selector: 'yht-anonymous-dashboard',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './anonymous-dashboard.component.html',
  styleUrl: './anonymous-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class AnonymousDashboardComponent {
  constructor(private dialog: MatDialog) {}

  openLoginForm(): void {
    this.dialog.open(LoginResetPasswordDialogComponent);
  }

  openRegisterForm(): void {
    this.dialog.open(RegisterFormComponent);
  }
}
