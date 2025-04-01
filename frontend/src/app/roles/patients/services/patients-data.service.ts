import { Injectable } from '@angular/core';

import { Endpoints } from '@core/misc';
import { ApiService } from '@core/services';

import { Patient } from '@roles/patients/types';

@Injectable()
export class PatientsDataService extends ApiService<Patient, Partial<Patient>> {
  protected url = Endpoints.urls.roles.patients;
}
