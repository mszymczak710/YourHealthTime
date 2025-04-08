import { AbstractControl, ValidationErrors } from '@angular/forms';

import { commonStrings } from '@core/misc';

export const lastNameValidator = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }

  const regex = /^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]*(?:[-' ][A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)*$/;
  const valid = regex.test(control.value);

  return valid ? null : { last_name: commonStrings.errors.form.lastName };
};
