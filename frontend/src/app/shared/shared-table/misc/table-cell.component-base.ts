import { Directive, Input } from '@angular/core';

import { NestedValuePipe } from '@core/pipes';

import { TableColumn } from '@shared/shared-table/types';

@Directive()
export class TableCellComponentBase {
  @Input() column: TableColumn;
  @Input() row: any;

  private nestedValuePipe = new NestedValuePipe();

  getValue(): any {
    return this.nestedValuePipe.transform(this.row, this.column.name);
  }
}
