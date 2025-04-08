import { FormFieldTypes } from '@shared/shared-form/types';

export interface TableFilter {
  extra?: boolean;
  omit?: boolean;
  placeholder?: string;
  type?: FormFieldTypes;
}
