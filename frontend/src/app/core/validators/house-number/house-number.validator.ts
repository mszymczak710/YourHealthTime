import { AbstractControl, ValidationErrors } from '@angular/forms';

import { commonStrings } from '@core/misc';

export const houseNumberValidator = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }

  const regex = /^[1-9]\d{0,2}[A-Za-z]?$/;
  const valid = regex.test(control.value);

  return valid ? null : { house_number: commonStrings.errors.form.houseNumber };
};
