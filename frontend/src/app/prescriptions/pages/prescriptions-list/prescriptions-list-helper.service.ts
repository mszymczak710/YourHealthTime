import { Injectable } from '@angular/core';

import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@prescriptions/misc';

import { ListHelper } from '@shared/shared-table/misc';
import { TableColumn, TableColumnTypes } from '@shared/shared-table/types';

export interface PrescriptionsListHelperService extends StringsLoader {}

@Injectable()
@ClassExtender([StringsLoader])
export class PrescriptionsListHelperService {
  prescriptionStrings = this.strings.prescription;

  getColumns(): TableColumn[] {
    return [
      ListHelper.getColumnDef('readable_id', TableColumnTypes.NUMBER, this.prescriptionStrings),
      ListHelper.getColumnDef('prescription_code', TableColumnTypes.TEXT, this.prescriptionStrings, {
        styles: {
          alignment: 'center',
          cssClass: 'text-nowrap',
          isNarrow: true
        }
      }),
      ListHelper.getColumnDef('doctor__user__first_name', TableColumnTypes.TEXT, this.prescriptionStrings),
      ListHelper.getColumnDef('doctor__user__last_name', TableColumnTypes.TEXT, this.prescriptionStrings),
      ListHelper.getColumnDef('patient__user__first_name', TableColumnTypes.TEXT, this.prescriptionStrings),
      ListHelper.getColumnDef('patient__user__last_name', TableColumnTypes.TEXT, this.prescriptionStrings),
      ListHelper.getColumnDef('issue_date', TableColumnTypes.DATE, this.prescriptionStrings),
      ListHelper.getColumnDef('expiry_date', TableColumnTypes.DATE, this.prescriptionStrings),
      ListHelper.getColumnDef('description', TableColumnTypes.TEXT, this.prescriptionStrings, {
        styles: {
          truncate: true
        }
      })
    ];
  }
}
