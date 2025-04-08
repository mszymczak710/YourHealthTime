import { AbstractControl, ValidationErrors } from '@angular/forms';

import { commonStrings } from '@core/misc';

export const postCodeValidator = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }

  const regex = /^\d{2}-\d{3}$/;
  const valid = regex.test(control.value);

  return valid ? null : { post_code: commonStrings.errors.form.postCode };
};
