import { Injectable } from '@angular/core';

import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@dictionaries/specializations/misc';

import { ListHelper } from '@shared/shared-table/misc';
import { TableColumn, TableColumnTypes } from '@shared/shared-table/types';

export interface SpecializationsListHelperService extends StringsLoader {}

@Injectable()
@ClassExtender([StringsLoader])
export class SpecializationsListHelperService {
  specializationStrings = this.strings.specialization;

  getColumns(): TableColumn[] {
    return [
      ListHelper.getColumnDef('readable_id', TableColumnTypes.NUMBER, this.specializationStrings),
      ListHelper.getColumnDef('name', TableColumnTypes.TEXT, this.specializationStrings)
    ];
  }
}
