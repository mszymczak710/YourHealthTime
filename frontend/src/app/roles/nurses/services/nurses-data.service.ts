import { Injectable } from '@angular/core';

import { Endpoints } from '@core/misc';
import { ApiService } from '@core/services';

import { Nurse } from '@roles/nurses/types';

@Injectable()
export class NursesDataService extends ApiService<Nurse> {
  protected url = Endpoints.urls.roles.nurses;
}
