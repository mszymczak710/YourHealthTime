import { CommonStrings, commonStrings } from '@core/misc';

import { MedicineListStrings, strings } from './strings';

export class StringsLoader {
  get commonStrings(): CommonStrings {
    return commonStrings;
  }

  get strings(): MedicineListStrings {
    return strings;
  }
}
