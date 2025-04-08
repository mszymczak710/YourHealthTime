import { AbstractControl, ValidationErrors } from '@angular/forms';

import { apartmentNumberValidator } from './apartment-number';
import { cityValidator } from './city';
import { firstNameValidator } from './first-name/first-name.validator';
import { houseNumberValidator } from './house-number';
import { lastNameValidator } from './last-name';
import { peselValidator } from './pesel';
import { phoneNumberValidator } from './phone-number';
import { postCodeValidator } from './post-code';
import { streetValidator } from './street';

export class CustomValidators {
  static apartmentNumber(control: AbstractControl): ValidationErrors | null {
    return apartmentNumberValidator(control);
  }

  static city(control: AbstractControl): ValidationErrors | null {
    return cityValidator(control);
  }

  static firstName(control: AbstractControl): ValidationErrors | null {
    return firstNameValidator(control);
  }

  static houseNumber(control: AbstractControl): ValidationErrors | null {
    return houseNumberValidator(control);
  }

  static lastName(control: AbstractControl): ValidationErrors | null {
    return lastNameValidator(control);
  }

  static pesel(control: AbstractControl): ValidationErrors | null {
    return peselValidator(control);
  }

  static phoneNumber(control: AbstractControl): ValidationErrors | null {
    return phoneNumberValidator(control);
  }

  static postCode(control: AbstractControl): ValidationErrors | null {
    return postCodeValidator(control);
  }

  static street(control: AbstractControl): ValidationErrors | null {
    return streetValidator(control);
  }
}
