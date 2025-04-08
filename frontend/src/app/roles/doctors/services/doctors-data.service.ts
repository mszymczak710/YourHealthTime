import { Injectable } from '@angular/core';

import { Endpoints } from '@core/misc';
import { ApiService } from '@core/services';

import { Doctor, DoctorPatchData } from '@roles/doctors/types';

@Injectable()
export class DoctorsDataService extends ApiService<Doctor, DoctorPatchData> {
  protected url = Endpoints.urls.roles.doctors;
}
