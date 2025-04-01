import { Injectable } from '@angular/core';

import { Endpoints } from '@core/misc';
import { ApiService } from '@core/services';

import { Prescription, PrescriptionSaveData } from '@prescriptions/types';

@Injectable()
export class PrescriptionsDataService extends ApiService<Prescription, PrescriptionSaveData> {
  protected url = Endpoints.urls.treatment.prescriptions;
}
