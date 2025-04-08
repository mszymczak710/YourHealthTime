import { ChangeDetectorRef, Directive, OnDestroy, OnInit, Optional } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

import moment from 'moment';
import { Moment } from 'moment-timezone';
import { Subscription } from 'rxjs';

import { DateFunctions } from '@shared/shared-form/misc/date-functions';
import { FieldComponentBase } from '@shared/shared-form/misc/field.component-base';

@Directive()
export class DateFieldComponentBase extends FieldComponentBase implements OnInit, OnDestroy {
  protected allSubscriptions = new Subscription();

  constructor(@Optional() protected cdr?: ChangeDetectorRef) {
    super(cdr);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.checkAndLaunchMomentConvertion(this.control);
    this.initListener(this.control);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.allSubscriptions?.unsubscribe();
  }

  protected initListener(control: UntypedFormControl): void {
    if (control) {
      this.allSubscriptions.add(
        control.valueChanges.subscribe({
          next: value => {
            this.dateChanged(value);
          }
        })
      );
    }
  }

  protected checkAndLaunchMomentConvertion(control: UntypedFormControl): void {
    if (control?.value && (moment.isMoment(control.value) || moment.isDate(control.value))) {
      this.convertMomentToBackendFormat(control.value);
    }
  }

  protected dateChanged(value: Moment): void {
    if (value) {
      this.convertMomentToBackendFormat(value);
    }
  }

  protected convertMomentToBackendFormat(value: Date | Moment): void {
    value.toJSON = value.toString = () => DateFunctions.transformToBackendFormat(value);
  }
}
