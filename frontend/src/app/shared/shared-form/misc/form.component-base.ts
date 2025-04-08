import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Directive, Optional } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { Observable } from 'rxjs';

import { handleRequestErrors } from '@core/misc';
import { NestedValuePipe } from '@core/pipes';

import { FormFields, FormFieldTypes } from '@shared/shared-form/types';

import { FormCanDeactivate } from './form-can-deactivate';

@Directive()
export abstract class FormComponentBase extends FormCanDeactivate {
  fieldNames: string[];
  fields: FormFields;
  form: UntypedFormGroup;
  formFieldTypes = FormFieldTypes;
  saving = false;

  private nestedValuePipe = new NestedValuePipe();

  constructor(@Optional() protected cdr?: ChangeDetectorRef) {
    super();
  }

  protected setFieldsReadonly(readonly = true, fields = this.fields, targetFields: string[] = []): void {
    const specificMode = targetFields.length > 0;

    fields.forEach((field, fieldName) => {
      const isTarget = targetFields.includes(fieldName);
      const isReadonly = specificMode ? (isTarget ? readonly : true) : readonly;

      fields.set(fieldName, { ...field, readonly: isReadonly });
    });
  }

  protected setFieldsValues(data: any, fields = this.fields): void {
    if (data) {
      fields.forEach((field, fieldName) => {
        const value = this.nestedValuePipe.transform(data, fieldName);
        field.value = value;
      });
    }
  }

  protected prepareForm(fields: FormFields = this.fields, returnForm = false): UntypedFormGroup | void {
    const formControls: { [key: string]: UntypedFormControl } = {};

    fields.forEach(field => {
      const validators = field.validators ? [...field.validators] : [];

      if (field.required) {
        validators.push(Validators.required);
      }

      if (!field.notEditable) {
        formControls[field.name] = new UntypedFormControl({ value: field.value, disabled: field.disabled }, validators);
      }
    });

    const form = new UntypedFormGroup(formControls);

    if (returnForm) {
      return form;
    } else {
      this.form = form;
    }
  }

  /**
   * Dodaje groupę do formularza.
   *
   * @param name nazwa grupy (klucz w strukturze reaktywnego formularza)
   * @param fields mapa pól (definicji), z których mają zostać stworzone `FormControle`
   */
  protected addGroupToForm(name: string, fields: FormFields): void | UntypedFormGroup {
    const group = this.prepareForm(fields, true) as UntypedFormGroup;
    this.form.addControl(name, group);
  }

  getFormControl(fieldName: string): UntypedFormControl {
    return this.form.get(fieldName) as UntypedFormControl;
  }

  getFormGroupControl(formGroup: UntypedFormGroup, fieldName: string): UntypedFormControl {
    return formGroup.get(fieldName) as UntypedFormControl;
  }

  protected handleError(error: HttpErrorResponse): void {
    this.saving = false;
    handleRequestErrors.call(this, error, this.form);
    this.cdr.markForCheck();
  }

  override canDeactivate(): boolean | Observable<boolean> {
    return !this.form.dirty;
  }
}
