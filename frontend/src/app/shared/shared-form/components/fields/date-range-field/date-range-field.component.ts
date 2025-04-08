import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Moment } from 'moment-timezone';
import { Subscription } from 'rxjs';

import { ClassExtender } from '@core/misc';

import { RequiredMarkComponent } from '@shared/shared-form/components/required-mark/required-mark.component';
import { DateFieldComponentBase, StringsLoader } from '@shared/shared-form/misc';
import { DateSuffixes, DateType } from '@shared/shared-form/types';

export interface DateRangeFieldComponent extends StringsLoader {}

@Component({
  selector: 'yht-date-range-field',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatDatepickerModule, MatTooltipModule, ReactiveFormsModule, RequiredMarkComponent],
  templateUrl: './date-range-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class DateRangeFieldComponent extends DateFieldComponentBase implements OnInit, OnDestroy {
  dateSuffixes = DateSuffixes;

  protected refreshComponentSubscription = new Subscription();

  get afterFieldName(): string {
    return `${this.field.name}_${DateSuffixes.AFTER}`;
  }

  get beforeFieldName(): string {
    return `${this.field.name}_${DateSuffixes.BEFORE}`;
  }

  get form(): UntypedFormGroup {
    return this.control.parent as UntypedFormGroup;
  }

  get hint(): string {
    return this.strings.dateRange.hint;
  }

  constructor(@Optional() protected cdr?: ChangeDetectorRef) {
    super(cdr);
  }

  ngOnInit(): void {
    this.createDateRangeControls(this.afterFieldName);
    this.createDateRangeControls(this.beforeFieldName);
    const startDateCtrl = this.form.get(this.afterFieldName) as UntypedFormControl;
    const endDateCtrl = this.form.get(this.beforeFieldName) as UntypedFormControl;
    this.checkAndLaunchMomentConvertion(startDateCtrl);
    this.checkAndLaunchMomentConvertion(endDateCtrl);
    this.initListenerOnStatusChanged();
  }

  ngOnDestroy(): void {
    this.controlStatusSubscription?.unsubscribe();
    super.ngOnDestroy();
  }

  private createDateRangeControls(controlName: string): void {
    if (!this.form.get(controlName)) {
      this.form.addControl(controlName, new UntypedFormControl({ value: null, disabled: this.field.disabled }));
    }
  }

  rangeDateChanged(event: MatDatepickerInputEvent<Moment>, dateSuffix: DateSuffixes): void {
    if (event.value) {
      this.convertMomentToBackendFormat(event.value);
      this.form.get(`${this.field.name}_${dateSuffix}`).setValue(event.value);
    }
  }

  getPlaceholder(dateType: DateType): string {
    return this.strings.dateRange[`${dateType}Date`].placeholder;
  }

  getTooltip(dateType: DateType): string {
    return this.strings.dateRange[`${dateType}Date`].tooltip;
  }
}
