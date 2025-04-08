import { Sort, SortDirection } from '@angular/material/sort';

import { environmentBase } from '@environments/environment-base';

import { CustomObject } from './custom-object';
import { ListPagination } from './list-pagination';

export interface OrderingType {
  column?: string;
  direction?: SortDirection;
}

export class ListParams {
  filters: CustomObject;
  ordering: OrderingType[];
  pagination: ListPagination;

  constructor(options?: { filters?: CustomObject; ordering?: OrderingType[]; pagination?: ListPagination }) {
    this.filters = options?.filters || {};
    this.ordering = options?.ordering || [environmentBase.list.ordering as OrderingType];
    this.pagination = new ListPagination(options ? options.pagination : null);
  }

  getParams(): CustomObject {
    return Object.assign({}, this.filters, this.getOrdering(), this.getPagination() || {});
  }

  private getPagination(): { limit: number; offset: number } {
    return this.pagination ? { limit: this.pagination.limit, offset: this.pagination.offset } : undefined;
  }

  setOrdering(sortEvent: Partial<Sort>): void {
    this.ordering = [{ column: sortEvent.active, direction: sortEvent.direction }];
  }

  private getOrdering(): { ordering?: string } {
    const orderingStr = this.ordering.map(orderingItem => this.transformOrderingToString(orderingItem)).join(',');
    return orderingStr ? { ordering: orderingStr } : {};
  }

  private transformOrderingToString(ordering: OrderingType): string {
    return ordering && ordering.column ? `${ordering.direction === 'desc' ? '-' : ''}${ordering.column}` : '';
  }
}
