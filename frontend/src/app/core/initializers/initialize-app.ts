import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';

import moment from 'moment';
import 'moment/locale/pl';

import { AuthFacade } from '@auth/services';

import { IconsRegistryService } from '@core/services';

moment.locale('pl');

registerLocaleData(localePl);

export function initializeApp(authFacade: AuthFacade, _iconsRegistry: IconsRegistryService): () => Promise<void> {
  // tylko initializeAuthState, a iconsRegistry uruchamia się w tle
  return () => authFacade.initializeAuthState();
}
