import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { StringsLoader } from '@auth/misc';

import { ClassExtender } from '@core/misc';

import { FormFieldSwitcherComponent } from '@shared/shared-form/components';
import { FormComponentBase } from '@shared/shared-form/misc';
import { FormField, FormFieldTypes } from '@shared/shared-form/types';

export interface LoginFormComponent extends FormComponentBase, StringsLoader {}

@Component({
  selector: 'yht-login-form',
  standalone: true,
  imports: [CommonModule, FormFieldSwitcherComponent, MatButtonModule, ReactiveFormsModule],
  templateUrl: './login-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class LoginFormComponent extends FormComponentBase implements OnInit {
  @Output() emailCopy = new EventEmitter<string>();
  @Output() resetPasswordViewChange = new EventEmitter<void>();

  readonly fieldNames = ['email', 'password'];

  constructor(protected override cdr: ChangeDetectorRef) {
    super(cdr);
  }

  ngOnInit(): void {
    this.prepareFields();
    this.prepareForm();
  }

  private prepareFields(): void {
    const idPrefix = 'login-form';
    this.fields = new Map<string, FormField>([
      [
        'email',
        {
          idPrefix,
          label: this.strings.login.fields.email.label,
          name: 'email',
          placeholder: this.strings.login.fields.email.placeholder,
          required: true,
          type: FormFieldTypes.EMAIL,
          validators: [Validators.email],
          onChange: (control: AbstractControl) => this.copyEmail(control)
        }
      ],
      [
        'password',
        {
          idPrefix,
          label: this.strings.login.fields.password.label,
          name: 'password',
          placeholder: this.strings.login.fields.password.placeholder,
          required: true,
          type: FormFieldTypes.PASSWORD
        }
      ]
    ]);
  }

  copyEmail(control: AbstractControl): void {
    if (control.valid) {
      this.emailCopy.emit(control.value);
    }
  }

  goToResetPasswordForm(): void {
    this.resetPasswordViewChange.emit();
  }
}
