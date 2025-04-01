import { FormFieldTypes } from '@shared/shared-form/form-common/types';

export interface TableFilter {
  extra?: boolean;
  omit?: boolean;
  placeholder?: string;
  type?: FormFieldTypes;
}
