import { Injectable } from '@angular/core';

import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@dictionaries/diseases/misc';

import { ListHelper } from '@shared/shared-table/misc';
import { TableColumn, TableColumnTypes } from '@shared/shared-table/types';

export interface DiseasesListHelperService extends StringsLoader {}

@Injectable()
@ClassExtender([StringsLoader])
export class DiseasesListHelperService {
  diseaseStrings = this.strings.disease;

  getColumns(): TableColumn[] {
    return [
      ListHelper.getColumnDef('readable_id', TableColumnTypes.NUMBER, this.diseaseStrings),
      ListHelper.getColumnDef('name', TableColumnTypes.TEXT, this.diseaseStrings)
    ];
  }
}
