import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { StringsLoader } from '@auth/misc';

import { ClassExtender } from '@core/misc';

import { FormFieldSwitcherComponent } from '@shared/shared-form/components';
import { FormComponentBase } from '@shared/shared-form/misc';
import { FormField, FormFieldTypes } from '@shared/shared-form/types';

export interface ResetPasswordFormComponent extends FormComponentBase, StringsLoader {}

@Component({
  selector: 'yht-reset-password-form',
  standalone: true,
  imports: [CommonModule, FormFieldSwitcherComponent, MatButtonModule, ReactiveFormsModule],
  templateUrl: './reset-password-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class ResetPasswordFormComponent extends FormComponentBase implements OnInit {
  readonly fieldNames = ['email', 'recaptcha_response'];

  constructor(protected override cdr: ChangeDetectorRef) {
    super(cdr);
  }

  ngOnInit(): void {
    this.prepareFields();
    this.prepareForm();
  }

  private prepareFields(): void {
    const idPrefix = 'reset-password-form';
    this.fields = new Map<string, FormField>([
      [
        'email',
        {
          idPrefix,
          label: this.strings.resetPassword.fields.email.label,
          name: 'email',
          placeholder: this.strings.resetPassword.fields.email.placeholder,
          required: true,
          type: FormFieldTypes.EMAIL,
          validators: [Validators.email]
        }
      ],
      [
        'recaptcha_response',
        {
          idPrefix,
          name: 'recaptcha_response',
          required: true,
          type: FormFieldTypes.RECAPTCHA
        }
      ]
    ]);
  }
}
