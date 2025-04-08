import { CommonStrings, commonStrings } from '@core/misc';

import { SpecializationListStrings, strings } from './strings';

export class StringsLoader {
  get commonStrings(): CommonStrings {
    return commonStrings;
  }

  get strings(): SpecializationListStrings {
    return strings;
  }
}
