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

import { StringsLoader } from '@dictionaries/diseases/misc';
import { DiseasesDataService, DiseasesFacade } from '@dictionaries/diseases/services';
import { Disease } from '@dictionaries/diseases/types';

import { TableCellLoaderComponent, TableFiltersComponent } from '@shared/shared-table/components';
import { FiltersToggleExpandAnimation, TableComponentBase } from '@shared/shared-table/misc';

import { DiseasesListHelperService } from './diseases-list-helper.service';

export interface DiseasesListComponent extends StringsLoader {}

@Component({
  selector: 'yht-diseases-list',
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
  providers: [DiseasesDataService, DiseasesFacade, DiseasesListHelperService],
  templateUrl: './diseases-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [FiltersToggleExpandAnimation()]
})
@ClassExtender([StringsLoader])
export class DiseasesListComponent extends TableComponentBase<Disease> {
  displayedColumns = ['readable_id', 'name'];

  constructor(
    protected cdr: ChangeDetectorRef,
    private diseasesFacade: DiseasesFacade,
    private diseasesListHelperService: DiseasesListHelperService
  ) {
    super(cdr);
  }

  protected initColumns(): void {
    this.columns = this.diseasesListHelperService.getColumns();
  }

  getData(refreshView = false): void {
    if (refreshView) {
      this.cdr.markForCheck();
    }
    this.loading = true;
    this.diseasesFacade.getDiseases(this.listParams).subscribe({
      next: resp => {
        this.data = resp.results;
        this.updatePagination(resp.count);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.handleError('[BŁĄD] Pobieranie chorób', error);
      }
    });
  }
}
