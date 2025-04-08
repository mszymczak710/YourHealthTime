import { Injectable } from '@angular/core';

import { ClassExtender } from '@core/misc';

import { FormFieldTypes } from '@shared/shared-form/types';
import { ListHelper } from '@shared/shared-table/misc';
import { TableColumn, TableColumnTypes, TableSelectCellData } from '@shared/shared-table/types';

import { StringsLoader } from '@visits/misc';
import { VisitStatus } from '@visits/types';

export interface VisitsListHelperService extends StringsLoader {}

@Injectable()
@ClassExtender([StringsLoader])
export class VisitsListHelperService {
  visitStrings = this.strings.visit;

  getColumns(): TableColumn[] {
    return [
      ListHelper.getColumnDef('readable_id', TableColumnTypes.NUMBER, this.visitStrings),
      ListHelper.getColumnDef('date', TableColumnTypes.DATETIME, this.visitStrings),
      ListHelper.getColumnDef('doctor__user__first_name', TableColumnTypes.TEXT, this.visitStrings),
      ListHelper.getColumnDef('doctor__user__last_name', TableColumnTypes.TEXT, this.visitStrings),
      ListHelper.getColumnDef('patient__user__first_name', TableColumnTypes.TEXT, this.visitStrings),
      ListHelper.getColumnDef('patient__user__last_name', TableColumnTypes.TEXT, this.visitStrings),
      ListHelper.getColumnDef('office__floor', TableColumnTypes.NUMBER, this.visitStrings, {
        filter: {
          extra: true,
          type: FormFieldTypes.NUMBER_RANGE
        }
      }),
      ListHelper.getColumnDef('office__room_number', TableColumnTypes.NUMBER, this.visitStrings, {
        filter: {
          extra: true,
          type: FormFieldTypes.NUMBER_RANGE
        }
      }),
      ListHelper.getColumnDef('duration_in_minutes', TableColumnTypes.NUMBER, this.visitStrings, {
        styles: {
          cssClass: 'text-wrap'
        },
        filter: {
          type: FormFieldTypes.NUMBER_RANGE
        }
      }),
      ListHelper.getColumnDef('is_remote', TableColumnTypes.BOOLEAN, this.visitStrings, {
        filter: {
          extra: true
        }
      }),
      ListHelper.getColumnDef('visit_status', TableColumnTypes.SELECT, this.visitStrings, {
        data: {
          options: [VisitStatus.COMPLETED, VisitStatus.IN_PROGRESS, VisitStatus.SCHEDULED].map(status => ({
            label: this.visitStrings.visit_status.options[status],
            value: status
          }))
        } as TableSelectCellData<{ label: string; value: string }>,
        styles: {
          cssClass: 'text-nowrap',
          isNarrow: true
        }
      })
    ];
  }
}
