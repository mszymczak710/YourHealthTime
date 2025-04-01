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

  /**
   * Metoda ustawiająca odpowiedni indeks strony oraz offset paginacji w sytuacji, gdy zostaną usunięte wiersze z aktualnej strony.
   * Paginację należy zaktualizować, jeśli zniknęły wszystkie elementy z danej strony.
   *
   * @param itemsOnCurrentPage liczba wszystkich wierszy na aktualnej stronie przed usunięciem
   * @param itemsRemoved liczba usuwanych elementów
   */
  updatePaginationOnRowsRemoved(itemsOnCurrentPage: number, itemsRemoved: number): void {
    if (itemsOnCurrentPage === itemsRemoved) {
      // czy wszystkie elementy ze strony zostały usunięte
      if (!this.nextPageExists() && this.pageIndex > 0) {
        // czy strona jest ostatnią i nie jest pierwszą
        this.setPagination({
          pageIndex: this.pageIndex - 1,
          pageSize: this.limit
        }); // przejście na poprzednią stronę w przypadku gdy na obecnej nie ma elementów
      }
    }
  }
}
