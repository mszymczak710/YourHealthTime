import { Directive } from '@angular/core';

import { environmentBase } from '@environments/environment-base';

import { FieldComponentBase } from '@shared/shared-form/misc';
import { FormFieldOption, FormFieldSelectData } from '@shared/shared-form/types';

@Directive()
export class SelectFieldComponentBase extends FieldComponentBase {
  get fieldData(): FormFieldSelectData {
    return this.field.data;
  }

  get optionLabelKey(): string {
    return this.field.data?.optionLabelKey || environmentBase.select.optionLabelKey;
  }

  get optionValueKey(): string {
    return this.field.data?.optionValueKey || environmentBase.select.optionValueKey;
  }

  getOptionLabel(option: FormFieldOption): string {
    return option ? option[this.optionLabelKey] : null;
  }

  getOptionValue(option: FormFieldOption): string {
    return option ? option[this.optionValueKey] : null;
  }

  getLabelFromValue(value: any): string {
    if (!this.fieldData?.options) {
      return '';
    }

    for (const option of this.fieldData.options) {
      if (option[this.optionValueKey] === value) {
        return option[this.optionLabelKey];
      }
    }

    return '';
  }
}
