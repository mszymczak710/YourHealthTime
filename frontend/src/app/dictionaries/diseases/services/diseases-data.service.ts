import { Injectable } from '@angular/core';

import { Endpoints } from '@core/misc';
import { ApiService } from '@core/services';

import { Disease } from '@dictionaries/diseases/types';

@Injectable()
export class DiseasesDataService extends ApiService<Disease> {
  protected url = Endpoints.urls.dictionaries.diseases;
}
