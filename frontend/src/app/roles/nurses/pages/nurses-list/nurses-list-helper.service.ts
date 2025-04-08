import { Injectable } from '@angular/core';

import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@roles/nurses/misc';

import { FormFieldTypes } from '@shared/shared-form/types';
import { ListHelper } from '@shared/shared-table/misc';
import { TableColumn, TableColumnTypes } from '@shared/shared-table/types';

export interface NursesListHelperService extends StringsLoader {}

@Injectable()
@ClassExtender([StringsLoader])
export class NursesListHelperService {
  nurseStrings = this.strings.nurse;

  getColumns(): TableColumn[] {
    return [
      ListHelper.getColumnDef('readable_id', TableColumnTypes.NUMBER, this.nurseStrings),
      ListHelper.getColumnDef('user__first_name', TableColumnTypes.TEXT, this.nurseStrings),
      ListHelper.getColumnDef('user__last_name', TableColumnTypes.TEXT, this.nurseStrings),
      ListHelper.getColumnDef('user__email', TableColumnTypes.TEXT, this.nurseStrings, {
        filter: {
          type: FormFieldTypes.EMAIL
        }
      }),
      ListHelper.getColumnDef('nursing_license_number', TableColumnTypes.TEXT, this.nurseStrings, {
        styles: {
          cssClass: 'text-nowrap',
          isNarrow: true
        }
      })
    ];
  }
}
