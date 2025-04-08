import { Injectable } from '@angular/core';

import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@dictionaries/offices/misc';

import { FormFieldTypes } from '@shared/shared-form/types';
import { ListHelper } from '@shared/shared-table/misc';
import { TableColumn, TableColumnTypes } from '@shared/shared-table/types';

export interface OfficesListHelperService extends StringsLoader {}

@Injectable()
@ClassExtender([StringsLoader])
export class OfficesListHelperService {
  officeStrings = this.strings.office;

  getColumns(): TableColumn[] {
    return [
      ListHelper.getColumnDef('readable_id', TableColumnTypes.NUMBER, this.officeStrings),
      ListHelper.getColumnDef('office_type__name', TableColumnTypes.TEXT, this.officeStrings),
      ListHelper.getColumnDef('floor', TableColumnTypes.NUMBER, this.officeStrings, {
        filter: {
          type: FormFieldTypes.NUMBER_RANGE
        }
      }),
      ListHelper.getColumnDef('room_number', TableColumnTypes.NUMBER, this.officeStrings, {
        filter: {
          type: FormFieldTypes.NUMBER_RANGE
        }
      })
    ];
  }
}
