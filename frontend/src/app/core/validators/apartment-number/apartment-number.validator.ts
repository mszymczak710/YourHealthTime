import { AbstractControl, ValidationErrors } from '@angular/forms';

import { commonStrings } from '@core/misc';

export const apartmentNumberValidator = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }

  const regex = /^[1-9]\d{0,2}$/;
  const valid = regex.test(control.value);

  return valid ? null : { apartment_number: commonStrings.errors.form.apartmentNumber };
};
