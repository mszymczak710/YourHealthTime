import { CommonStrings, commonStrings } from '@core/misc';

import { LayoutStrings, strings } from '@layout/misc/strings';

export class StringsLoader {
  get commonStrings(): CommonStrings {
    return commonStrings;
  }

  get strings(): LayoutStrings {
    return strings;
  }
}
