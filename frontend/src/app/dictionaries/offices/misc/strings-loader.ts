import { CommonStrings, commonStrings } from '@core/misc';

import { OfficeListStrings, strings } from './strings';

export class StringsLoader {
  get commonStrings(): CommonStrings {
    return commonStrings;
  }

  get strings(): OfficeListStrings {
    return strings;
  }
}
