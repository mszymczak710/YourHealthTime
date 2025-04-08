import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

import { sprintf } from 'sprintf-js';

import { strings } from '@shared/shared-table/misc';

@Injectable()
export class MatPaginatorIntlPl extends MatPaginatorIntl {
  paginatorStrings = strings;
  override itemsPerPageLabel = this.paginatorStrings.paginator.itemsPerPageLabel;
  override nextPageLabel = this.paginatorStrings.paginator.nextPageLabel;
  override previousPageLabel = this.paginatorStrings.paginator.previousPageLabel;
  override firstPageLabel = this.paginatorStrings.paginator.firstPageLabel;
  override lastPageLabel = this.paginatorStrings.paginator.lastPageLabel;

  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return sprintf(this.paginatorStrings.paginator.rangeLabel, 0, 0, length);
    }
    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, length);
    return sprintf(this.paginatorStrings.paginator.rangeLabel, startIndex + 1, endIndex, length);
  };
}
