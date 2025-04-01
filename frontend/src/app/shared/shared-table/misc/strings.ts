export const strings = Object.freeze({
  filterButton: {
    collapse: 'Zwiń sekcję z filtrami',
    expand: 'Rozwiń sekcję z filtrami'
  },
  filters: {
    apply: 'Zastosuj',
    clear: 'Wyczyść',
    hideExtra: 'Ukryj dodatkowe filtry',
    showExtra: 'Pokaż dodatkowe filtry'
  },
  paginator: {
    itemsPerPageLabel: 'Elementów na stronę:',
    firstPageLabel: 'Pierwsza strona',
    lastPageLabel: 'Ostatnia strona',
    nextPageLabel: 'Następna strona',
    previousPageLabel: 'Poprzednia strona',
    rangeLabel: '%s – %s z %s'
  },
  table: {
    actions: {
      expander: {
        collapse: 'Zwiń wiersz',
        expand: 'Rozwiń wiersz'
      }
    },
    cells: {
      boolean: {
        value: {
          false: 'Nie',
          together: 'Razem',
          true: 'Tak'
        }
      }
    }
  }
});

export type SharedTableStrings = typeof strings;
