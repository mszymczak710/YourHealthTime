import { CommonStrings, commonStrings } from '@core/misc';

import { PrerscriptionsListStrings, strings } from './strings';

export class StringsLoader {
  get commonStrings(): CommonStrings {
    return commonStrings;
  }

  get strings(): PrerscriptionsListStrings {
    return strings;
  }
}
