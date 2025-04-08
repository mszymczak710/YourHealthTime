import { MAT_TIME_LOCALE, MatTimepickerModule, TimeAdapter } from '@dhutaryan/ngx-mat-timepicker';

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import moment from 'moment';
import { Moment } from 'moment-timezone';

import { ClassExtender } from '@core/misc';

import { RequiredMarkComponent } from '@shared/shared-form/components/required-mark/required-mark.component';
import { DateFieldComponentBase, DateFunctions, MomentTimeAdapter, StringsLoader } from '@shared/shared-form/misc';

export interface TimeFieldComponent extends StringsLoader {}

@Component({
  selector: 'yht-time-field',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatTimepickerModule, ReactiveFormsModule, RequiredMarkComponent],
  templateUrl: './time-field.component.html',
  providers: [
    { provide: MAT_TIME_LOCALE, useValue: 'pl-PL' },
    { provide: TimeAdapter, useClass: MomentTimeAdapter }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class TimeFieldComponent extends DateFieldComponentBase {
  get placeholder(): string {
    return this.strings.time.placeholder;
  }

  /**
   * Nadpisuje domyślne zachowanie metody `toJSON`, w celu kontroli formatu daty,
   * do której jest przekształcany obiekt w HttpClient'cie
   *
   * @param value data jako obiekt typu Moment
   */
  protected convertMomentToBackendFormat(value: Moment): void {
    let momentValue: Moment;

    if (moment.isMoment(value)) {
      momentValue = value;
    } else {
      const [hours, minutes] = (value as string).toString().split(':').map(Number);
      momentValue = moment().hours(hours).minutes(minutes);
    }

    momentValue.toJSON = () => DateFunctions.transformTimeToBackendFormat(momentValue);
  }

  submit(event: Event): void {
    event.preventDefault();

    if (!this.control.value) {
      this.control.setValue(moment(), { emitEvent: false });
      this.convertMomentToBackendFormat(this.control.value);
    }
  }
}
