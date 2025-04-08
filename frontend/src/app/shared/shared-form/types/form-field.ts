import { AbstractControl, ValidatorFn } from '@angular/forms';

import { OrderingType } from '@core/types';

import { AutocompleteDataSourceFunction } from '@shared/shared-form/types';

import { FormFieldTypes } from './form-field-types';

export interface FormField {
  data?: any;
  disabled?: boolean;
  errors?: string;
  idPrefix: string;
  label?: string;
  labelledBy?: string;
  labelHidden?: boolean;
  name: string;
  notEditable?: boolean;
  placeholder?: string;
  readonly?: boolean;
  required?: boolean;
  type: FormFieldTypes;
  validators?: ValidatorFn[];
  value?: any;
  onChange?: (control: AbstractControl) => void;
}

export type FormFields = Map<string, FormField>;

export interface FormFieldAutocompleteData<T = any> {
  dataSourceFn: AutocompleteDataSourceFunction<T>;
  minHintChars?: number;
  optionLabelFn?: (value: T) => string;
  optionLabelKey: string;
  optionValueKey: string;
  ordering?: OrderingType[];
}

export interface FormFieldNumberData {
  max?: number;
  min?: number;
  step?: number;
}

export interface FormFieldRadioData {
  options: { label: string; value: any }[];
}

export interface FormFieldSelectData<T = any> {
  optionLabelKey: string;
  optionValueKey: string;
  options: T[];
}
