import { Directive } from '@angular/core';

import { environmentBase } from '@environments/environment-base';

import { FieldComponentBase, strings } from '@shared/shared-form/misc';

@Directive()
export class NumberFieldComponentBase extends FieldComponentBase {
  get max(): number {
    return this.field?.data?.max ?? environmentBase.inputNumber.max;
  }

  get min(): number {
    return this.field?.data?.min ?? environmentBase.inputNumber.min;
  }

  get placeholder(): string {
    return this.field.readonly ? environmentBase.emptyPlaceholder : this.field.placeholder || strings.inputNumber.placeholder;
  }

  get step(): number {
    return this.field?.data?.step ?? environmentBase.inputNumber.step;
  }
}
