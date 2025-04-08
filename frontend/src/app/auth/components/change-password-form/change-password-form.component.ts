import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { StringsLoader } from '@auth/misc';
import { AuthFacade } from '@auth/services';

import { SpinnerComponent } from '@core/components';
import { ClassExtender } from '@core/misc';
import { ToastService } from '@core/services';

import { FormFieldSwitcherComponent } from '@shared/shared-form/components';
import { DialogFormCanDeactivate, FormComponentBase } from '@shared/shared-form/misc';
import { FormField, FormFieldTypes } from '@shared/shared-form/types';

export interface ChangePasswordFormComponent
  extends DialogFormCanDeactivate<ChangePasswordFormComponent, void>,
    FormComponentBase,
    StringsLoader {}

@Component({
  selector: 'yht-change-password-form',
  standalone: true,
  imports: [CommonModule, FormFieldSwitcherComponent, MatButtonModule, MatDialogModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './change-password-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([DialogFormCanDeactivate, StringsLoader])
export class ChangePasswordFormComponent extends FormComponentBase implements OnInit {
  readonly fieldNames = ['old_password', 'password', 'password_confirm'];

  constructor(
    protected override cdr: ChangeDetectorRef,
    protected dialogRef: MatDialogRef<ChangePasswordFormComponent, void>,
    private authFacade: AuthFacade,
    private toastService: ToastService
  ) {
    super(cdr);
  }

  ngOnInit(): void {
    this.dialogRef.addPanelClass('dialog-sm');
    this.handleClose();
    this.prepareFields();
    this.prepareForm();
  }

  private prepareFields(): void {
    const idPrefix = 'change-password-form';
    this.fields = new Map<string, FormField>([
      [
        'old_password',
        {
          idPrefix,
          label: this.strings.changePassword.fields.old_password.label,
          name: 'old_password',
          placeholder: this.strings.changePassword.fields.old_password.placeholder,
          required: true,
          type: FormFieldTypes.PASSWORD
        }
      ],
      [
        'password',
        {
          idPrefix,
          label: this.strings.changePassword.fields.password.label,
          name: 'password',
          placeholder: this.strings.changePassword.fields.password.placeholder,
          required: true,
          type: FormFieldTypes.PASSWORD
        }
      ],
      [
        'password_confirm',
        {
          idPrefix,
          label: this.strings.changePassword.fields.password_confirm.label,
          name: 'password_confirm',
          placeholder: this.strings.changePassword.fields.password_confirm.placeholder,
          required: true,
          type: FormFieldTypes.PASSWORD
        }
      ]
    ]);
  }

  submit(event: Event): void {
    event.preventDefault();
    this.saving = true;

    this.authFacade.changePassword(this.form.value).subscribe({
      next: () => {
        this.dialogRef.close();
        this.toastService.showSuccessMessage(this.strings.changePassword.succeed);
      },
      error: error => {
        this.handleError(error);
      }
    });
  }
}
