import { Injectable } from '@angular/core';

import { Endpoints } from '@core/misc';
import { ApiService } from '@core/services';

import { Country } from '@dictionaries/countries/types';

@Injectable()
export class CountriesDataService extends ApiService<Country> {
  protected url = Endpoints.urls.dictionaries.countries;
}
