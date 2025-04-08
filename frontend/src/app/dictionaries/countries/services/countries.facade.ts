import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ListParams, ListResponse } from '@core/types';

import { Country } from '@dictionaries/countries/types';

import { CountriesDataService } from './countries-data.service';

@Injectable()
export class CountriesFacade {
  countries: Country[];

  constructor(private countriesDataService: CountriesDataService) {}

  getCountries(params: ListParams): Observable<ListResponse<Country>> {
    return this.countriesDataService.getList(params);
  }
}
