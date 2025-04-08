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

import { StringsLoader } from '@dictionaries/offices/misc';
import { OfficesDataService, OfficesFacade } from '@dictionaries/offices/services';
import { Office } from '@dictionaries/offices/types';

import { TableCellLoaderComponent, TableFiltersComponent } from '@shared/shared-table/components';
import { FiltersToggleExpandAnimation, TableComponentBase } from '@shared/shared-table/misc';

import { OfficesListHelperService } from './offices-list-helper.service';

export interface OfficesListComponent extends StringsLoader {}

@Component({
  selector: 'yht-offices-list',
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
  providers: [OfficesDataService, OfficesFacade, OfficesListHelperService],
  templateUrl: './offices-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [FiltersToggleExpandAnimation()]
})
@ClassExtender([StringsLoader])
export class OfficesListComponent extends TableComponentBase<Office> {
  displayedColumns = ['readable_id', 'office_type__name', 'room_number', 'floor'];

  constructor(
    protected cdr: ChangeDetectorRef,
    private officesFacade: OfficesFacade,
    private officesListHelperService: OfficesListHelperService
  ) {
    super(cdr);
  }

  protected initColumns(): void {
    this.columns = this.officesListHelperService.getColumns();
  }

  getData(refreshView = false): void {
    if (refreshView) {
      this.cdr.markForCheck();
    }
    this.loading = true;
    this.officesFacade.getOffices(this.listParams).subscribe({
      next: resp => {
        this.data = resp.results;
        this.updatePagination(resp.count);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.handleError('[BŁĄD] Pobieranie gabinetów', error);
      }
    });
  }
}
