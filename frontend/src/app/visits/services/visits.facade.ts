import { Injectable } from '@angular/core';

import { Observable, map } from 'rxjs';

import { ListParams, ListResponse } from '@core/types';

import { Visit, VisitSaveData } from '@visits/types';

import { VisitsDataService } from './visits-data.service';

@Injectable()
export class VisitsFacade {
  constructor(private visitsDataService: VisitsDataService) {}

  getVisits(params: ListParams): Observable<ListResponse<Visit>> {
    return this.visitsDataService.getList(params).pipe(
      map(resp => {
        resp.results = resp.results.map(visit => new Visit(visit));
        return resp;
      })
    );
  }

  createVisit(data: VisitSaveData): Observable<Visit> {
    return this.visitsDataService.post(data);
  }

  updateVisit(id: string, data: VisitSaveData): Observable<Visit> {
    return this.visitsDataService.patch(id, data);
  }

  deleteVisit(id: string): Observable<unknown> {
    return this.visitsDataService.delete(id);
  }
}
