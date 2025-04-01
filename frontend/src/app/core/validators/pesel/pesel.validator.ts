import { AbstractControl, ValidationErrors } from '@angular/forms';

import { commonStrings } from '@core/misc';

export const peselValidator = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }

  const regex = /^\d{11}$/;
  const validFormat = regex.test(control.value);

  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  const checkSum = weights.reduce((sum, w, i) => sum + w * parseInt(control.value[i], 10), 0) % 10;

  if ((10 - checkSum) % 10 !== parseInt(control.value[10], 10)) {
    return { pesel: commonStrings.errors.form.pesel.checkSum };
  }

  if (!validFormat) {
    return { pesel: commonStrings.errors.form.pesel.length };
  }

  return null;
};
