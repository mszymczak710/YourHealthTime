import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ListParams, ListResponse } from '@core/types';

import { Specialization } from '@dictionaries/specializations/types';

import { SpecializationsDataService } from './specializations-data.service';

@Injectable()
export class SpecializationsFacade {
  constructor(private specializationsDataService: SpecializationsDataService) {}

  getSpecializations(params: ListParams): Observable<ListResponse<Specialization>> {
    return this.specializationsDataService.getList(params);
  }
}
