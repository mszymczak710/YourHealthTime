import { MAT_TIME_LOCALE, MatTimePeriodType, TimeAdapter } from '@dhutaryan/ngx-mat-timepicker';

import { Inject, Injectable, Optional, inject } from '@angular/core';

import moment, { Moment } from 'moment-timezone';

const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|(?:(?:\+|-)\d{2}:\d{2}))?)?$/;

@Injectable()
export class MomentTimeAdapter extends TimeAdapter<Moment> {
  private readonly _matTimeLocale = inject(MAT_TIME_LOCALE, { optional: true });

  constructor(@Optional() @Inject(MAT_TIME_LOCALE) matTimeLocale: string) {
    super();
    if (matTimeLocale !== undefined) {
      this._matTimeLocale = matTimeLocale;
    }
    super.setLocale(this._matTimeLocale);
  }

  now(): Moment {
    return moment();
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  parse(value: any, parseFormat?: any): Moment | null {
    if (typeof value === 'number') {
      return moment.unix(value);
    } else if (typeof value === 'string') {
      if (ISO_8601_REGEX.test(value)) {
        const momentDate = moment(value, moment.ISO_8601);
        return momentDate.isValid() ? momentDate : null;
      } else {
        const { hour, minute, meridiem } = this.parseTime(value);
        const correctedHour = meridiem === 'pm' && hour < 12 ? hour + 12 : hour;
        const date = new Date();
        date.setHours(correctedHour);
        date.setMinutes(minute);
        const dateToMoment = moment(date);
        return dateToMoment.isValid() ? dateToMoment : null;
      }
    } else if (moment.isMoment(value)) {
      return value;
    } else if (value instanceof Date) {
      return moment(value);
    }
    return null;
  }

  parseTime(value: string): {
    hour: number;
    minute: number;
    meridiem?: 'am' | 'pm';
  } {
    const time = value.replace(/(\sam|\spm|\sAM|\sPM|am|pm|AM|PM)/g, '');
    const meridiem = value.replace(time, '').trim().toLowerCase() as 'am' | 'pm';
    const [hour, minute] = time.split(':');

    return { hour: Number(hour), minute: Number(minute), meridiem };
  }

  getHour(date: Moment): number {
    return date.hours();
  }

  getMinute(date: Moment): number {
    return date.minutes();
  }

  updateHour(date: Moment, hour: number): Moment {
    return date.clone().hours(hour);
  }

  updateMinute(date: Moment, minute: number): Moment {
    return date.clone().minutes(minute);
  }

  getPeriod(date: Moment): MatTimePeriodType {
    return date.hours() < 12 ? 'am' : 'pm';
  }

  // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
  format(date: Moment, displayFormat: Object): string {
    if (!this.isValid(date)) {
      throw Error('MomentTimeAdapter: Cannot format invalid date.');
    }

    const dtf = new Intl.DateTimeFormat(this.locale, {
      ...displayFormat,
      timeZone: 'utc'
    });
    // eslint-disable-next-line no-underscore-dangle
    return this._format(dtf, date);
  }

  private _format(dtf: Intl.DateTimeFormat, date: Moment): string {
    const d = moment.utc();
    d.set({
      year: date.year(),
      month: date.month(),
      date: date.date(),
      hour: date.hour(),
      minute: date.minute(),
      second: date.second(),
      millisecond: date.millisecond()
    });
    return dtf.format(d.toDate());
  }

  override deserialize(value: any): Moment | null {
    if (typeof value === 'string' && value) {
      if (ISO_8601_REGEX.test(value)) {
        const momentDate = moment(value, moment.ISO_8601);
        if (momentDate.isValid()) {
          return momentDate;
        }
      } else {
        const parsedMoment = moment(value, ['HH:mm', 'hh:mm A'], true);
        return parsedMoment.isValid() ? parsedMoment : null;
      }
    } else if (moment.isMoment(value) && value.isValid()) {
      return value;
    } else if (value instanceof Date && !isNaN(value.getTime())) {
      return moment(value);
    }
    return null;
  }

  isTimeInstance(obj: any): boolean {
    return moment.isMoment(obj);
  }

  isValid(date: Moment): boolean {
    return date.isValid();
  }

  invalid(): Moment {
    return moment.invalid();
  }

  compareTime(first: Moment, second: Moment): number {
    return first.hours() - second.hours() || first.minutes() - second.minutes();
  }
}
