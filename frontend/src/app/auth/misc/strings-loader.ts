import { AuthStrings, strings } from '@auth/misc/strings';

import { CommonStrings, commonStrings } from '@core/misc';

export class StringsLoader {
  get commonStrings(): CommonStrings {
    return commonStrings;
  }

  get strings(): AuthStrings {
    return strings;
  }
}
