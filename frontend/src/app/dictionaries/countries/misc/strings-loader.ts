import { CommonStrings, commonStrings } from '@core/misc';

import { CountryListStrings, strings } from './strings';

export class StringsLoader {
  get commonStrings(): CommonStrings {
    return commonStrings;
  }

  get strings(): CountryListStrings {
    return strings;
  }
}
