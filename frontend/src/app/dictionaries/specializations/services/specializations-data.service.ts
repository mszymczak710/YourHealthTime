import { Injectable } from '@angular/core';

import { Endpoints } from '@core/misc';
import { ApiService } from '@core/services';

import { Specialization } from '@dictionaries/specializations/types';

@Injectable()
export class SpecializationsDataService extends ApiService<Specialization> {
  protected url = Endpoints.urls.dictionaries.specializations;
}
