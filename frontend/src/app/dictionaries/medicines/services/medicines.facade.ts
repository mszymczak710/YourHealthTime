import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ListParams, ListResponse } from '@core/types';

import { Medicine } from '@dictionaries/medicines/types';

import { MedicinesDataService } from './medicines-data.service';

@Injectable()
export class MedicinesFacade {
  constructor(private medicinesDataService: MedicinesDataService) {}

  getMedicines(params: ListParams): Observable<ListResponse<Medicine>> {
    return this.medicinesDataService.getList(params);
  }
}
