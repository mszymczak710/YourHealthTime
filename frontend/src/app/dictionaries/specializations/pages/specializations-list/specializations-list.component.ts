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

import { StringsLoader } from '@dictionaries/specializations/misc';
import { SpecializationsDataService, SpecializationsFacade } from '@dictionaries/specializations/services';
import { Specialization } from '@dictionaries/specializations/types';

import { TableCellLoaderComponent, TableFiltersComponent } from '@shared/shared-table/components';
import { FiltersToggleExpandAnimation, TableComponentBase } from '@shared/shared-table/misc';

import { SpecializationsListHelperService } from './specializations-list-helper.service';

export interface SpecializationsListComponent extends StringsLoader {}
@Component({
  selector: 'yht-specializations-list',
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
  providers: [SpecializationsDataService, SpecializationsFacade, SpecializationsListHelperService],
  templateUrl: './specializations-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [FiltersToggleExpandAnimation()]
})
@ClassExtender([StringsLoader])
export class SpecializationsListComponent extends TableComponentBase<Specialization> {
  displayedColumns = ['readable_id', 'name'];

  constructor(
    protected cdr: ChangeDetectorRef,
    private specializationsFacade: SpecializationsFacade,
    private specializationsListHelperService: SpecializationsListHelperService
  ) {
    super(cdr);
  }

  protected initColumns(): void {
    this.columns = this.specializationsListHelperService.getColumns();
  }

  getData(refreshView = false): void {
    if (refreshView) {
      this.cdr.markForCheck();
    }
    this.loading = true;
    this.specializationsFacade.getSpecializations(this.listParams).subscribe({
      next: resp => {
        this.data = resp.results;
        this.updatePagination(resp.count);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.handleError('[BŁĄD] Pobieranie specjalizacji', error);
      }
    });
  }
}
