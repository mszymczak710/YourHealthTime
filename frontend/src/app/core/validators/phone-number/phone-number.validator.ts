import { AbstractControl, ValidationErrors } from '@angular/forms';

import { commonStrings } from '@core/misc';

export const phoneNumberValidator = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }

  const regex = /^\+?(\d{1,3}[-\s]?)?(\(0\d{1,2}\)|0\d{1,2}[-\s]?)?(\d{1,4}[-\s]?){2,3}\d{1,4}$/;
  const valid = regex.test(control.value);

  return valid ? null : { phone_number: commonStrings.errors.form.phoneNumber };
};
