import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SpinnerComponent } from '@core/components';
import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@dictionaries/countries/misc';
import { CountriesDataService, CountriesFacade } from '@dictionaries/countries/services';
import { Country } from '@dictionaries/countries/types';

import { TableCellLoaderComponent, TableFiltersComponent } from '@shared/shared-table/components';
import { FiltersToggleExpandAnimation, TableComponentBase } from '@shared/shared-table/misc';

import { CountriesListHelperService } from './countries-list-helper.service';

export interface CountriesListComponent extends StringsLoader {}
@Component({
  selector: 'yht-countries-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    SpinnerComponent,
    TableCellLoaderComponent,
    TableFiltersComponent
  ],
  providers: [CountriesDataService, CountriesFacade, CountriesListHelperService],
  templateUrl: './countries-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [FiltersToggleExpandAnimation()]
})
@ClassExtender([StringsLoader])
export class CountriesListComponent extends TableComponentBase<Country> {
  displayedColumns = ['readable_id', 'code', 'name'];

  constructor(
    protected cdr: ChangeDetectorRef,
    private countriesFacade: CountriesFacade,
    private countriesListHelperService: CountriesListHelperService
  ) {
    super(cdr);
  }

  protected initColumns(): void {
    this.columns = this.countriesListHelperService.getColumns();
  }

  getData(refreshView = false): void {
    if (refreshView) {
      this.cdr.markForCheck();
    }
    this.loading = true;
    this.countriesFacade.getCountries(this.listParams).subscribe({
      next: resp => {
        this.data = resp.results;
        this.updatePagination(resp.count);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.handleError('[BŁĄD] Pobieranie krajów', error);
      }
    });
  }
}
