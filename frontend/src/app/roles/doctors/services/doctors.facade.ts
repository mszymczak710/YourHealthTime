import { Injectable } from '@angular/core';

import { MonoTypeOperatorFunction, Observable, map, pipe } from 'rxjs';

import { ListParams, ListResponse } from '@core/types';

import { Doctor, DoctorPatchData } from '@roles/doctors/types';

import { DoctorsDataService } from './doctors-data.service';

@Injectable()
export class DoctorsFacade {
  constructor(private doctorsDataService: DoctorsDataService) {}

  getDoctors(listParams: ListParams): Observable<ListResponse<Doctor>> {
    return this.doctorsDataService.getList(listParams);
  }

  getDoctor(id: string): Observable<Doctor> {
    return this.doctorsDataService.get(id).pipe(this.convertDoctor());
  }

  updateDoctor(id: string, data: DoctorPatchData): Observable<Doctor> {
    return this.doctorsDataService.patch(id, data).pipe(this.convertDoctor());
  }

  private convertDoctor(): MonoTypeOperatorFunction<Doctor> {
    return pipe(map(doctor => new Doctor(doctor)));
  }
}
