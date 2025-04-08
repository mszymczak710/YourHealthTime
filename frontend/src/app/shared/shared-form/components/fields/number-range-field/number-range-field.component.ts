import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ClassExtender } from '@core/misc';

import { NumberFieldComponentBase, StringsLoader } from '@shared/shared-form/misc';
import { NumberRangeType } from '@shared/shared-form/types';

export interface NumberRangeFieldComponent extends StringsLoader {}

@Component({
  selector: 'yht-number-range-field',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatTooltipModule, ReactiveFormsModule],
  templateUrl: './number-range-field.component.html',
  styleUrl: './number-range-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class NumberRangeFieldComponent extends NumberFieldComponentBase implements OnInit {
  numberRange = NumberRangeType;

  get form(): UntypedFormGroup {
    return this.control.parent as UntypedFormGroup;
  }

  get maxFieldName(): string {
    return `${this.field.name}_${NumberRangeType.MAX}`;
  }

  get minFieldName(): string {
    return `${this.field.name}_${NumberRangeType.MIN}`;
  }

  ngOnInit(): void {
    this.createNumberRangeControls(this.minFieldName);
    this.createNumberRangeControls(this.maxFieldName);
    super.ngOnInit();
  }

  private createNumberRangeControls(controlName: string): void {
    if (!this.form.get(controlName)) {
      this.form.addControl(controlName, new UntypedFormControl({ value: null, disabled: this.field.disabled }));
    }
  }

  getPlaceholder(type: NumberRangeType): string {
    return this.strings.numberRange[type].placeholder;
  }

  getTooltip(type: NumberRangeType): string {
    return this.strings.numberRange[type].tooltip;
  }
}
