import { CommonStrings, commonStrings } from '@core/misc';

import { PatientsListStrings, strings } from './strings';

export class StringsLoader {
  get commonStrings(): CommonStrings {
    return commonStrings;
  }

  get strings(): PatientsListStrings {
    return strings;
  }
}
