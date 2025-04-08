import { Injectable } from '@angular/core';

import { Observable, map } from 'rxjs';

import { ListParams, ListResponse } from '@core/types';

import { Prescription, PrescriptionSaveData } from '@prescriptions/types';

import { PrescriptionsDataService } from './prescriptions-data.service';

@Injectable()
export class PrescriptionsFacade {
  constructor(private prescriptionsDataService: PrescriptionsDataService) {}

  getPrescriptions(params: ListParams): Observable<ListResponse<Prescription>> {
    return this.prescriptionsDataService.getList(params).pipe(
      map(resp => {
        resp.results = resp.results.map(prescription => new Prescription(prescription));
        return resp;
      })
    );
  }

  createPrescription(data: PrescriptionSaveData): Observable<Prescription> {
    return this.prescriptionsDataService.post(data);
  }

  deletePrescription(id: string): Observable<unknown> {
    return this.prescriptionsDataService.delete(id);
  }
}
