import { CommonStrings, commonStrings } from '@core/misc';

import { NursesListStrings, strings } from './strings';

export class StringsLoader {
  get commonStrings(): CommonStrings {
    return commonStrings;
  }

  get strings(): NursesListStrings {
    return strings;
  }
}
