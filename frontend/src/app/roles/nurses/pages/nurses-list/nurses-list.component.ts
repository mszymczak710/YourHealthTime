import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SpinnerComponent } from '@core/components/spinner/spinner.component';
import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@roles/nurses/misc';
import { NursesListHelperService } from '@roles/nurses/pages/nurses-list/nurses-list-helper.service';
import { NursesDataService, NursesFacade } from '@roles/nurses/services';
import { Nurse } from '@roles/nurses/types';

import { TableCellLoaderComponent, TableFiltersComponent } from '@shared/shared-table/components';
import { FiltersToggleExpandAnimation, TableComponentBase } from '@shared/shared-table/misc';

export interface NursesListComponent extends StringsLoader {}

@Component({
  selector: 'yht-nurses-list',
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
  providers: [NursesDataService, NursesFacade, NursesListHelperService],
  templateUrl: './nurses-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [FiltersToggleExpandAnimation()]
})
@ClassExtender([StringsLoader])
export class NursesListComponent extends TableComponentBase<Nurse> {
  displayedColumns = ['readable_id', 'user__first_name', 'user__last_name', 'user__email', 'nursing_license_number'];

  constructor(
    protected cdr: ChangeDetectorRef,
    private nursesFacade: NursesFacade,
    private nursesListHelper: NursesListHelperService
  ) {
    super(cdr);
  }

  protected initColumns(): void {
    this.columns = this.nursesListHelper.getColumns();
  }

  getData(refreshView = false): void {
    if (refreshView) {
      this.cdr.markForCheck();
    }
    this.loading = true;
    this.nursesFacade.getNurses(this.listParams).subscribe({
      next: resp => {
        this.data = resp.results;
        this.updatePagination(resp.count);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.handleError('[BŁĄD] Pobieranie pielęgniarek', error);
      }
    });
  }
}
