import { CommonStrings, commonStrings } from '@core/misc';

import { SharedTableStrings, strings } from './strings';

export class StringsLoader {
  get commonStrings(): CommonStrings {
    return commonStrings;
  }

  get strings(): SharedTableStrings {
    return strings;
  }
}
