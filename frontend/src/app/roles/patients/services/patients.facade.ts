import { Injectable } from '@angular/core';

import { map, MonoTypeOperatorFunction, Observable, pipe } from 'rxjs';

import { ListParams, ListResponse } from '@core/types';

import { Patient } from '@roles/patients/types';

import { PatientsDataService } from './patients-data.service';

@Injectable()
export class PatientsFacade {
  constructor(private patientsDataService: PatientsDataService) {}

  getPatients(listParams: ListParams): Observable<ListResponse<Patient>> {
    return this.patientsDataService.getList(listParams);
  }

  getPatient(id: string): Observable<Patient> {
    return this.patientsDataService.get(id).pipe(this.convertPatient());
  }

  updatePatient(id: string, data: Partial<Patient>): Observable<Patient> {
    return this.patientsDataService.patch(id, data).pipe(this.convertPatient());
  }

  private convertPatient(): MonoTypeOperatorFunction<Patient> {
    return pipe(map(resp => new Patient(resp)));
  }
}
