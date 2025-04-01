import { Injectable } from '@angular/core';

import { map, MonoTypeOperatorFunction, Observable, pipe } from 'rxjs';

import { ListParams, ListResponse } from '@core/types';

import { Nurse } from '@roles/nurses/types';

import { NursesDataService } from './nurses-data.service';

@Injectable()
export class NursesFacade {
  constructor(private nursesDataService: NursesDataService) {}

  getNurses(listParams: ListParams): Observable<ListResponse<Nurse>> {
    return this.nursesDataService.getList(listParams);
  }

  getNurse(id: string): Observable<Nurse> {
    return this.nursesDataService.get(id).pipe(this.convertNurse());
  }

  private convertNurse(): MonoTypeOperatorFunction<Nurse> {
    return pipe(map(resp => new Nurse(resp)));
  }
}
