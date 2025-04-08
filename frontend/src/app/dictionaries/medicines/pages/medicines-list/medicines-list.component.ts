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

import { MedicineIngredientsRowComponent } from '@dictionaries/medicines/components';
import { StringsLoader } from '@dictionaries/medicines/misc';
import { MedicinesDataService, MedicinesFacade } from '@dictionaries/medicines/services';
import { Medicine } from '@dictionaries/medicines/types';

import { TableCellLoaderComponent, TableFiltersComponent } from '@shared/shared-table/components';
import { ExpandableRowAnimation, FiltersToggleExpandAnimation } from '@shared/shared-table/misc';
import { TableRowExpanderComponentBase } from '@shared/shared-table/misc/table-row-expander.component-base';

import { MedicinesListHelperService } from './medicines-list-helper.service';

export interface MedicinesListComponent extends StringsLoader {}

@Component({
  selector: 'yht-medicines-list',
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
    MedicineIngredientsRowComponent,
    SpinnerComponent,
    TableCellLoaderComponent,
    TableFiltersComponent
  ],
  providers: [MedicinesDataService, MedicinesFacade, MedicinesListHelperService],
  templateUrl: './medicines-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [ExpandableRowAnimation(), FiltersToggleExpandAnimation()]
})
@ClassExtender([StringsLoader])
export class MedicinesListComponent extends TableRowExpanderComponentBase<Medicine> {
  displayedColumns = ['readable_id', 'name', 'type_of_medicine__name', 'form__name'];

  constructor(
    protected cdr: ChangeDetectorRef,
    private medicinesFacade: MedicinesFacade,
    private medicinesListHelperService: MedicinesListHelperService
  ) {
    super(cdr);
  }

  protected initColumns(): void {
    this.columns = this.medicinesListHelperService.getColumns();
  }

  getData(refreshView = false): void {
    if (refreshView) {
      this.cdr.markForCheck();
    }
    this.loading = true;
    this.medicinesFacade.getMedicines(this.listParams).subscribe({
      next: resp => {
        this.data = resp.results.map(row => ({ ...row, isExpanded: false }));
        this.updatePagination(resp.count);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.handleError('[BŁĄD] Pobieranie leków', error);
      }
    });
  }
}
