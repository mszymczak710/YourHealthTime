import { Injectable } from '@angular/core';

import { Endpoints } from '@core/misc';
import { ApiService } from '@core/services';

import { Office } from '@dictionaries/offices/types';

@Injectable()
export class OfficesDataService extends ApiService<Office> {
  protected url = Endpoints.urls.dictionaries.offices;
}
