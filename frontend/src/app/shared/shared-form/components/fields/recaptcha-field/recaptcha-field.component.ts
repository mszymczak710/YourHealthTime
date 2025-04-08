import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatError } from '@angular/material/form-field';

import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';

import { environmentBase } from '@environments/environment-base';

import { FieldComponentBase } from '@shared/shared-form/misc';

@Component({
  selector: 'yht-recaptcha-field',
  standalone: true,
  imports: [MatError, ReactiveFormsModule, RecaptchaFormsModule, RecaptchaModule],
  templateUrl: './recaptcha-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecaptchaFieldComponent extends FieldComponentBase {
  siteKey = environmentBase.recaptchaSiteKey;

  onRecaptchaResolved(recaptchaResponse: string): void {
    this.control.setValue(recaptchaResponse);
  }
}
