import { AbstractControl, ValidationErrors } from '@angular/forms';

import { commonStrings } from '@core/misc';

export const streetValidator = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }

  const regex = /^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż -]*(\s[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż -]*)*$/;
  const valid = regex.test(control.value);

  return valid ? null : { street: commonStrings.errors.form.street };
};
