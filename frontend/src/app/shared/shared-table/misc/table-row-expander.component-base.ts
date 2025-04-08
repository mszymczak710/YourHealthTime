import { ChangeDetectorRef, Directive, Optional } from '@angular/core';

import { TableComponentBase } from '@shared/shared-table/misc/table.component-base';

export type TRow<T> = T & { isExpanded: boolean };

@Directive()
export abstract class TableRowExpanderComponentBase<T> extends TableComponentBase<T> {
  protected constStartColumns = ['expander'];

  constructor(@Optional() protected cdr?: ChangeDetectorRef) {
    super(cdr);
  }

  abstract getData(args?: any): void;

  protected abstract initColumns(): void;

  protected override setDisplayedColumnsNames(): void {
    this.displayedColumns = [...this.constStartColumns, ...this.columns.map(col => col.name), ...this.constEndColumns];
  }

  getExpanderLabel(row: TRow<T>): string {
    return this.tableStrings.table.actions.expander[row.isExpanded ? 'collapse' : 'expand'];
  }

  rowExpanded(row: TRow<T>): void {
    row.isExpanded = !row.isExpanded;
  }
}
