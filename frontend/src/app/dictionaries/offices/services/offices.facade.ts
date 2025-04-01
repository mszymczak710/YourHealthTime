import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ListParams, ListResponse } from '@core/types';

import { Office } from '@dictionaries/offices/types';

import { OfficesDataService } from './offices-data.service';

@Injectable()
export class OfficesFacade {
  constructor(private officesDataService: OfficesDataService) {}

  getOffices(params: ListParams): Observable<ListResponse<Office>> {
    return this.officesDataService.getList(params);
  }
}
