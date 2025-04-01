import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Directive, OnInit, Optional, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';

import { NestedValuePipe } from '@core/pipes';
import { CustomObject, ListPagination, ListParams } from '@core/types';

import { strings } from '@shared/shared-table/misc';
import { TableColumn } from '@shared/shared-table/types';

@Directive()
export abstract class TableComponentBase<T> implements OnInit {
  columns: TableColumn<T>[];
  tableStrings = strings;

  private _paginator: MatPaginator;
  private _sort: MatSort;
  private nestedValuePipe = new NestedValuePipe();

  displayedColumns: string[];

  protected listParams = new ListParams({
    pagination: new ListPagination()
  });

  protected constEndColumns: string[] = [];

  data: T[] = [];
  httpError: HttpErrorResponse;
  loading = true;
  showFilters = false;
  sortInitialized = false;

  @ViewChild(MatPaginator)
  set paginator(paginator: MatPaginator) {
    if (paginator) {
      this._paginator = paginator;
      this.syncPaginatorWithListParams();
    }
  }
  get paginator(): MatPaginator {
    return this._paginator;
  }

  @ViewChild(MatSort)
  set sort(sort: MatSort) {
    if (sort) {
      this._sort = sort;
      this.syncSortWithListParams();
    }
  }
  get sort(): MatSort {
    return this._sort;
  }

  constructor(@Optional() protected cdr?: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initColumns();
    this.setDisplayedColumnsNames();
    this.getData();
  }

  /**
   * Synchronizuje wartości paginacji w `MatPaginator` z `this.listParams.pagination`
   */
  private syncPaginatorWithListParams(): void {
    if (this.paginator && this.listParams) {
      const { pageIndex, limit, limitOptions, count } = this.listParams.pagination;
      this.paginator.pageIndex = pageIndex;
      this.paginator.pageSize = limit;
      this.paginator.pageSizeOptions = limitOptions;
      this.paginator.length = count;
    }
  }

  /**
   * Synchronizuje wartości sortowania w `MatSort` z `this.listParams.ordering`
   */
  private syncSortWithListParams(): void {
    if (this.sort && this.listParams?.ordering.length) {
      const { column, direction } = this.listParams.ordering[0];
      this.sort.active = column;
      this.sort.direction = direction;
      this.sortInitialized = true;
      this.sort.sortChange.emit({ active: column, direction });
    }
  }

  abstract getData(args?: any): void;

  protected abstract initColumns(): void;

  getColumnValue(columnName: string, row: any): any {
    return this.nestedValuePipe.transform(row, columnName);
  }

  updatePagination(count: number): void {
    this.listParams.pagination.count = count;
    this.syncPaginatorWithListParams();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  protected handleError(message: string, error: HttpErrorResponse): void {
    console.error(message, error);
    this.loading = false;
    this.httpError = error;
    this.cdr.markForCheck();
  }

  /**
   * Obsługa zmiany strony w `MatPaginator`
   */
  onPageChange(event: PageEvent): void {
    this.listParams.pagination.setPagination(event);
    this.getData(true);
  }

  onFiltersChanged(event: CustomObject): void {
    this.listParams.filters = event;
    this.getData(true);
  }

  /**
   * Obsługa zmiany sortowania w `MatSort`
   */
  onSortChange(event: Sort): void {
    if (this.sortInitialized) {
      this.sortInitialized = false;
      return;
    }

    this.listParams.setOrdering(event);
    this.getData(true);
  }

  protected setDisplayedColumnsNames(): void {
    this.displayedColumns = [...this.columns.map(col => col.name), ...this.constEndColumns];
  }
}
