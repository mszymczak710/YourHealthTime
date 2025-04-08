import { Injectable } from '@angular/core';

import { Endpoints } from '@core/misc';
import { ApiService } from '@core/services';

import { Medicine } from '@dictionaries/medicines/types';

@Injectable()
export class MedicinesDataService extends ApiService<Medicine> {
  protected url = Endpoints.urls.dictionaries.medicines;
}
