import { PageEvent } from '@angular/material/paginator';

import { environmentBase } from '@environments/environment-base';

export class ListPagination {
  count?: number; // liczba wszystkich rekordów w bazie
  limit: number;
  limitOptions: number[];
  private listOffset: number; // przesunięcie oznaczające stronę
  next?: string;
  pageIndex: number; // pole potrzebne do odświeżania numeru strony w `mat-paginator`
  // przy resetowaniu paginacji (ma to miejsce przy zmianie limitu paginacji)

  constructor(options?: { limit?: number; limitOptions?: number[]; offset?: number }) {
    this.limit = options?.limit ?? environmentBase.list.limit;
    this.limitOptions = options?.limitOptions?.length ? options.limitOptions : environmentBase.list.limitOptions;
    this.offset = options?.offset || 0;
  }

  set offset(offset: number) {
    this.listOffset = offset;
    this.setCurrentPage();
  }

  get offset(): number {
    return this.listOffset;
  }

  setPagination(pageEvent: Partial<PageEvent>): void {
    if (pageEvent.pageSize !== this.limit) {
      this.limit = pageEvent.pageSize;
      this.reset(); // jeśli został zmieniony limit, należy zresetować paginację (ustawić na 1. stronę)
    } else {
      this.offset = pageEvent.pageIndex * this.limit;
    }
  }

  private setCurrentPage(): void {
    this.pageIndex = this.offset / this.limit;
  }

  nextPage(): void {
    this.offset = this.offset + this.limit;
  }

  reset(): void {
    this.offset = 0;
  }

  nextPageExists(): boolean {
    return !!this.next;
  }
}
