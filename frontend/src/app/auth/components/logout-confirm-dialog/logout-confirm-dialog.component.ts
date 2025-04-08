import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { StringsLoader } from '@auth/misc';
import { AuthFacade } from '@auth/services';

import { ClassExtender } from '@core/misc';
import { ToastService } from '@core/services';

export interface LogoutConfirmDialogComponent extends StringsLoader {}

@Component({
  selector: 'yht-logout-confirm-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './logout-confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class LogoutConfirmDialogComponent implements OnInit {
  errorMessage: string;

  constructor(
    private authFacade: AuthFacade,
    private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<LogoutConfirmDialogComponent, void>,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.dialogRef.addPanelClass('dialog-sm');
  }

  logout(): void {
    this.authFacade.logout().subscribe({
      next: () => {
        this.dialogRef.close();
        this.toastService.showSuccessMessage(this.strings.logout.succeed);
      },
      error: (error: HttpErrorResponse) => {
        if (error.error.detail) {
          this.setErrorMessage(error.error.detail);
        } else if (error.error.non_field_errors) {
          this.setErrorMessage(error.error.non_field_errors);
        }
        this.cdr.markForCheck();
      }
    });
  }

  private setErrorMessage(error: any): void {
    this.errorMessage = Array.isArray(error) ? error.join('. ') : error;
  }
}
