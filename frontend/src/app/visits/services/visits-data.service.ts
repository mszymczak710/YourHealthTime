import { Injectable } from '@angular/core';

import { Endpoints } from '@core/misc';
import { ApiService } from '@core/services';

import { Visit, VisitSaveData } from '@visits/types';

@Injectable()
export class VisitsDataService extends ApiService<Visit, VisitSaveData> {
  protected url = Endpoints.urls.treatment.visits;
}
