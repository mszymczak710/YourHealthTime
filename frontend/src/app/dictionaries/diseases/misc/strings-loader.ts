import { CommonStrings, commonStrings } from '@core/misc';

import { DiseaseListStrings, strings } from './strings';

export class StringsLoader {
  get commonStrings(): CommonStrings {
    return commonStrings;
  }

  get strings(): DiseaseListStrings {
    return strings;
  }
}
