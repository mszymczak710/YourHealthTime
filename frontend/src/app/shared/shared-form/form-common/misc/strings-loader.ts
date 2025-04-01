import { CommonStrings, commonStrings } from '@core/misc';

import { SharedFormStrings, strings } from '@shared/shared-form/form-common/misc/strings';

export class StringsLoader {
  get commonStrings(): CommonStrings {
    return commonStrings;
  }

  get strings(): SharedFormStrings {
    return strings;
  }
}
