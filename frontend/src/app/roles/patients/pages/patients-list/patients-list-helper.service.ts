import { Injectable } from '@angular/core';

import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@roles/patients/misc';
import { Gender } from '@roles/patients/types';

import { FormFieldTypes } from '@shared/shared-form/types';
import { ListHelper } from '@shared/shared-table/misc';
import { TableColumn, TableColumnTypes, TableSelectCellData } from '@shared/shared-table/types';

export interface PatientsListHelperService extends StringsLoader {}

@Injectable()
@ClassExtender([StringsLoader])
export class PatientsListHelperService {
  patientStrings = this.strings.patient;

  getColumns(): TableColumn[] {
    return [
      ListHelper.getColumnDef('readable_id', TableColumnTypes.NUMBER, this.patientStrings),
      ListHelper.getColumnDef('user__first_name', TableColumnTypes.TEXT, this.patientStrings, {
        styles: {
          cssClass: 'text-nowrap',
          isNarrow: true
        }
      }),
      ListHelper.getColumnDef('user__last_name', TableColumnTypes.TEXT, this.patientStrings, {
        styles: {
          cssClass: 'text-nowrap',
          isNarrow: true
        }
      }),
      ListHelper.getColumnDef('user__email', TableColumnTypes.TEXT, this.patientStrings, {
        filter: {
          extra: true,
          type: FormFieldTypes.EMAIL
        },
        styles: {
          cssClass: 'text-nowrap',
          isNarrow: true
        }
      }),
      ListHelper.getColumnDef('pesel', TableColumnTypes.TEXT, this.patientStrings, {
        styles: {
          cssClass: 'text-nowrap',
          isNarrow: true
        }
      }),
      ListHelper.getColumnDef('birth_date', TableColumnTypes.DATE, this.patientStrings),
      ListHelper.getColumnDef('gender', TableColumnTypes.SELECT, this.patientStrings, {
        data: {
          options: [Gender.FEMALE, Gender.MALE].map(value => ({
            label: this.patientStrings.gender.options[value],
            value
          }))
        } as TableSelectCellData<{ label: string; value: string }>,
        styles: {
          cssClass: 'text-nowrap',
          isNarrow: true
        }
      }),
      ListHelper.getColumnDef('phone_number', TableColumnTypes.TEXT, this.patientStrings, {
        filter: {
          extra: true,
          type: FormFieldTypes.PHONE
        },
        styles: {
          cssClass: 'text-nowrap',
          isNarrow: true
        }
      }),
      ListHelper.getColumnDef('address', TableColumnTypes.TEXT, this.patientStrings, {
        filter: {
          omit: true
        },
        sortable: false,
        styles: {
          cssClass: 'text-nowrap',
          isNarrow: true
        }
      })
    ];
  }
}
