import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { SpinnerComponent } from '@core/components';
import { ToastService } from '@core/services';

import { ConfirmDialogData } from '@shared/shared-confirm/types';

@Component({
  selector: 'yht-confirm-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, SpinnerComponent],
  templateUrl: './confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
  errorMessage: string;
  saving = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public confirmData: ConfirmDialogData,
    private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>,
    private toastService: ToastService
  ) {}

  confirm(): void {
    this.saving = true;
    this.confirmData.onConfirm().subscribe({
      next: () => {
        if (this.confirmData.successMessage) {
          this.toastService.showSuccessMessage(this.confirmData.successMessage);
        }
        this.dialogRef.close(true);
      },
      error: (error: HttpErrorResponse) => {
        this.saving = false;
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
