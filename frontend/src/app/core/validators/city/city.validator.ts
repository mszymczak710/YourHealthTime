import { AbstractControl, ValidationErrors } from '@angular/forms';

import { commonStrings } from '@core/misc';

export const cityValidator = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }

  const regex = /^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż -]*(\s[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż -]*)*$/;
  const valid = regex.test(control.value);

  return valid ? null : { city: commonStrings.errors.form.city };
};
