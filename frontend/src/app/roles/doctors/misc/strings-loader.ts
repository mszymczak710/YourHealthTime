import { CommonStrings, commonStrings } from '@core/misc';

import { DoctorsListStrings, strings } from './strings';

export class StringsLoader {
  get commonStrings(): CommonStrings {
    return commonStrings;
  }

  get strings(): DoctorsListStrings {
    return strings;
  }
}
