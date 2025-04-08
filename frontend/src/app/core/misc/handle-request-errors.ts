import { HttpErrorResponse } from '@angular/common/http';
import { UntypedFormGroup } from '@angular/forms';

export const handleRequestErrors = (error: HttpErrorResponse, form: UntypedFormGroup): void => {
  if (error.error && typeof error.error === 'object') {
    if (error.error.detail) {
      setGeneralError(error.error.detail, form);
    } else if (error.error.non_field_errors) {
      setGeneralError(error.error.non_field_errors, form);
    } else {
      processErrors(error.error, form);
    }
  }
};

/**
 * Przetwarza rekurencyjnie błędy i przypisuje je do pól formularza
 */
const processErrors = (errors: any, form: UntypedFormGroup, parentKey = ''): void => {
  Object.keys(errors).forEach(key => {
    const fieldPath = parentKey ? `${parentKey}.${key}` : key;

    if (Array.isArray(errors[key])) {
      setFieldError(fieldPath, errors[key], form);
    } else if (typeof errors[key] === 'object' && errors[key] !== null) {
      processErrors(errors[key], form, fieldPath);
    }
  });
};

/**
 * Ustawia błąd dla danego pola formularza
 */
const setFieldError = (fieldName: string, error: any, form: UntypedFormGroup): void => {
  const control = form.get(fieldName);
  if (control) {
    const errorMessage = Array.isArray(error) ? error.join('. ') : error;
    control.setErrors({ [fieldName]: errorMessage });
    control.markAsTouched();
  }
};

/**
 * Ustawia ogólny błąd formularza
 */
const setGeneralError = (error: any, form: UntypedFormGroup): void => {
  const errorMessages = Array.isArray(error) ? error.join('. ') : error;
  form.setErrors({ general: errorMessages });
};
