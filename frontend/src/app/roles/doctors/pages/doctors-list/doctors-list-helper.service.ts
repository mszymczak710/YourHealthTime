import { Injectable } from '@angular/core';

import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@roles/doctors/misc';

import { FormFieldTypes } from '@shared/shared-form/types';
import { ListHelper } from '@shared/shared-table/misc';
import { TableColumn, TableColumnTypes } from '@shared/shared-table/types';

export interface DoctorsListHelperService extends StringsLoader {}

@Injectable()
@ClassExtender([StringsLoader])
export class DoctorsListHelperService {
  doctorStrings = this.strings.doctor;

  getColumns(): TableColumn[] {
    return [
      ListHelper.getColumnDef('readable_id', TableColumnTypes.NUMBER, this.doctorStrings),
      ListHelper.getColumnDef('user__first_name', TableColumnTypes.TEXT, this.doctorStrings),
      ListHelper.getColumnDef('user__last_name', TableColumnTypes.TEXT, this.doctorStrings),
      ListHelper.getColumnDef('user__email', TableColumnTypes.TEXT, this.doctorStrings, {
        filter: {
          type: FormFieldTypes.EMAIL
        }
      }),
      ListHelper.getColumnDef('job_execution_number', TableColumnTypes.TEXT, this.doctorStrings)
    ];
  }
}
