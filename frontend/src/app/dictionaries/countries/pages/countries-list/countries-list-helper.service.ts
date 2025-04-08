import { Injectable } from '@angular/core';

import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@dictionaries/countries/misc';

import { ListHelper } from '@shared/shared-table/misc';
import { TableColumn, TableColumnTypes } from '@shared/shared-table/types';

export interface CountriesListHelperService extends StringsLoader {}

@Injectable()
@ClassExtender([StringsLoader])
export class CountriesListHelperService {
  countryStrings = this.strings.country;

  getColumns(): TableColumn[] {
    return [
      ListHelper.getColumnDef('readable_id', TableColumnTypes.NUMBER, this.countryStrings),
      ListHelper.getColumnDef('code', TableColumnTypes.TEXT, this.countryStrings, {
        styles: {
          cssClass: 'text-nowrap',
          isNarrow: true
        }
      }),
      ListHelper.getColumnDef('name', TableColumnTypes.TEXT, this.countryStrings)
    ];
  }
}
