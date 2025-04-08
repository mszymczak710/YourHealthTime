import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ListParams, ListResponse } from '@core/types';

import { Disease } from '@dictionaries/diseases/types';

import { DiseasesDataService } from './diseases-data.service';

@Injectable()
export class DiseasesFacade {
  constructor(private diseasesDataService: DiseasesDataService) {}

  getDiseases(params: ListParams): Observable<ListResponse<Disease>> {
    return this.diseasesDataService.getList(params);
  }
}
