import moment, { Moment } from 'moment-timezone';
import { environmentBase } from 'src/environments/environment-base';

export class DateFunctions {
  static transformToBackendFormat(value: moment.MomentInput): string {
    return moment(value).format(environmentBase.backendDateFormat);
  }

  static transformDateTimeToBackendFormat(date: moment.MomentInput, hour: moment.MomentInput): string {
    const dateString = moment(date).format(environmentBase.backendDateFormat);
    const timeString = moment(hour, environmentBase.backendTimeFormat).format(environmentBase.backendTimeFormat);

    return moment
      .tz(`${dateString} ${timeString}`, environmentBase.backendDateTimeFormat, environmentBase.timezone)
      .format(environmentBase.backendDateTimeFormat);
  }

  static transformTimeToBackendFormat(value: moment.MomentInput): string {
    return moment(value).format(environmentBase.backendTimeFormat);
  }

  static getDate(date?: moment.MomentInput, format?: string, strict = false): Moment {
    const momentDate = moment(date, format, strict);
    if (format) {
      momentDate.toJSON = () => momentDate.format(format);
    }
    return momentDate;
  }

  static format(date: moment.MomentInput, time = false): string {
    return this.getDate(date).format(time ? environmentBase.dateTimeFormatMoment : environmentBase.dateFormatMoment);
  }
}
