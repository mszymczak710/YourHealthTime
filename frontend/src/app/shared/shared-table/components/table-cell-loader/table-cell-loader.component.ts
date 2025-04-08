import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import {
  BooleanCellComponent,
  DateCellComponent,
  DatetimeCellComponent,
  NumberCellComponent,
  SelectCellComponent,
  TextCellComponent
} from '@shared/shared-table/components/table-cells';
import { TableColumn, TableColumnTypes } from '@shared/shared-table/types';

@Component({
  selector: 'yht-table-cell-loader',
  standalone: true,
  imports: [
    CommonModule,
    BooleanCellComponent,
    DateCellComponent,
    DatetimeCellComponent,
    NumberCellComponent,
    SelectCellComponent,
    TextCellComponent
  ],
  templateUrl: './table-cell-loader.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellLoaderComponent {
  @Input() column: TableColumn;
  @Input() row: any;

  columnTypes = TableColumnTypes;
}
