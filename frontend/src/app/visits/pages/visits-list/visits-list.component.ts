import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { sprintf } from 'sprintf-js';

import { UserRole } from '@auth/types';

import { SpinnerComponent } from '@core/components/spinner/spinner.component';
import { PermissionDirective } from '@core/directives';
import { ClassExtender } from '@core/misc';

import { ConfirmDialogComponent } from '@shared/shared-confirm/components';
import { ConfirmDialogData } from '@shared/shared-confirm/types';
import { TableActionComponent, TableCellLoaderComponent, TableFiltersComponent } from '@shared/shared-table/components';
import { FiltersToggleExpandAnimation, TableComponentBase } from '@shared/shared-table/misc';
import { TableAction } from '@shared/shared-table/types';

import { VisitFormComponent } from '@visits/components/visit-form/visit-form.component';
import { StringsLoader } from '@visits/misc';
import { VisitsDataService, VisitsFacade } from '@visits/services';
import { Visit } from '@visits/types';

import { VisitsListHelperService } from './visits-list-helper.service';

export interface VisitsListComponent extends StringsLoader {}

@Component({
  selector: 'wvw-visits-list',
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
    PermissionDirective,
    SpinnerComponent,
    TableActionComponent,
    TableCellLoaderComponent,
    TableFiltersComponent
  ],
  providers: [VisitsDataService, VisitsFacade, VisitsListHelperService],
  templateUrl: './visits-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [FiltersToggleExpandAnimation()]
})
@ClassExtender([StringsLoader])
export class VisitsListComponent extends TableComponentBase<Visit> {
  displayedColumns = [
    'readable_id',
    'date',
    'doctor__user__first_name',
    'doctor__user__last_name',
    'patient__user__first_name',
    'patient__user__last_name',
    'office__floor',
    'office__room_number',
    'duration_in_minutes',
    'is_remote',
    'visit_status'
  ];

  protected constEndColumns = ['actions'];

  actions: TableAction[] = [
    {
      action: (visit: Visit) => this.openFormDialog(visit),
      icon: 'pencil-outline',
      label: this.strings.actions.edit.label,
      permissions: [UserRole.ADMIN]
    },
    {
      action: (visit: Visit) => this.deleteVisit(visit),
      icon: 'delete',
      label: this.strings.actions.delete.label,
      permissions: [UserRole.ADMIN]
    }
  ];

  userRole = UserRole;

  constructor(
    protected cdr: ChangeDetectorRef,
    private visitsFacade: VisitsFacade,
    private dialog: MatDialog,
    private visitsListHelper: VisitsListHelperService
  ) {
    super(cdr);
  }

  protected initColumns(): void {
    this.columns = this.visitsListHelper.getColumns();
  }

  getData(refreshView = false): void {
    if (refreshView) {
      this.cdr.markForCheck();
    }
    this.loading = true;
    this.visitsFacade.getVisits(this.listParams).subscribe({
      next: resp => {
        this.data = resp.results;
        this.updatePagination(resp.count);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.handleError('[BŁĄD] Pobieranie wizyt', error);
      }
    });
  }

  private deleteVisit(visit: Visit): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          cancelLabel: this.commonStrings.no,
          confirmLabel: this.commonStrings.yes,
          content: sprintf(this.strings.actions.delete.confirm.content, visit.readable_id),
          onConfirm: () => this.visitsFacade.deleteVisit(visit.id),
          successMessage: sprintf(this.strings.actions.delete.confirm.succeed, visit.readable_id),
          title: this.strings.actions.delete.confirm.title
        } as ConfirmDialogData
      })
      .afterClosed()
      .subscribe(visitDeleted => {
        if (visitDeleted) {
          this.getData(true);
        }
      });
  }

  openFormDialog(visit?: Visit): void {
    this.dialog
      .open<VisitFormComponent, Visit, Visit>(VisitFormComponent, { data: visit })
      .afterClosed()
      .subscribe(visitCreatedOrUpdated => {
        if (visitCreatedOrUpdated) {
          this.getData(true);
        }
      });
  }
}
