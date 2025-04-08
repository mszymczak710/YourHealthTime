import { Injectable } from '@angular/core';

import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@dictionaries/medicines/misc';

import { ListHelper } from '@shared/shared-table/misc';
import { TableColumn, TableColumnTypes } from '@shared/shared-table/types';

export interface MedicinesListHelperService extends StringsLoader {}

@Injectable()
@ClassExtender([StringsLoader])
export class MedicinesListHelperService {
  medicineStrings = this.strings.medicine;

  getColumns(): TableColumn[] {
    return [
      ListHelper.getColumnDef('readable_id', TableColumnTypes.NUMBER, this.medicineStrings),
      ListHelper.getColumnDef('name', TableColumnTypes.TEXT, this.medicineStrings),
      ListHelper.getColumnDef('type_of_medicine__name', TableColumnTypes.TEXT, this.medicineStrings),
      ListHelper.getColumnDef('form__name', TableColumnTypes.TEXT, this.medicineStrings, {
        styles: {
          cssClass: 'text-nowrap',
          isNarrow: true
        }
      })
    ];
  }
}
