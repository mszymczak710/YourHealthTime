import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';

import { StringsLoader } from '@auth/misc';
import { AuthFacade } from '@auth/services';

import { SpinnerComponent } from '@core/components';
import { ClassExtender } from '@core/misc';
import { ToastService } from '@core/services';

import { FormFieldSwitcherComponent } from '@shared/shared-form/components';
import { FormComponentBase } from '@shared/shared-form/misc';
import { FormField, FormFieldTypes } from '@shared/shared-form/types';

export interface ResetPasswordConfirmationComponent extends FormComponentBase, StringsLoader {}

@Component({
  selector: 'yht-reset-password-confirmation',
  standalone: true,
  imports: [CommonModule, FormFieldSwitcherComponent, MatButtonModule, MatCardModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './reset-password-confirmation.component.html',
  styleUrl: './reset-password-confirmation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class ResetPasswordConfirmationComponent extends FormComponentBase implements OnInit {
  readonly fieldNames = ['password', 'password_confirm'];

  constructor(
    protected override cdr: ChangeDetectorRef,
    private authFacade: AuthFacade,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    super();
  }

  ngOnInit(): void {
    this.prepareFields();
    this.prepareForm();
  }

  private prepareFields(): void {
    const idPrefix = 'reset-password-confirmation-form';
    this.fields = new Map<string, FormField>([
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

    const uidb64 = this.route.snapshot.paramMap.get('uidb64');
    const token = this.route.snapshot.paramMap.get('token');
    const params = { uidb64, token };
    this.authFacade.confirmResetPassword(params, this.form.value).subscribe({
      next: () => {
        this.saving = false;
        this.toastService.showSuccessMessage(this.strings.resetPassword.confirm.succeed);
      },
      error: error => {
        this.handleError(error);
      }
    });
  }
}
