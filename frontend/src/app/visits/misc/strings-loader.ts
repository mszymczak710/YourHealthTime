import { CommonStrings, commonStrings } from '@core/misc';

import { VisitsListStrings, strings } from './strings';

export class StringsLoader {
  get commonStrings(): CommonStrings {
    return commonStrings;
  }

  get strings(): VisitsListStrings {
    return strings;
  }
}
