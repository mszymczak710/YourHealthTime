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

import { PrescriptionDosagesRowComponent } from '@prescriptions/components';
import { PrescriptionCreateFormComponent } from '@prescriptions/components/prescription-create-form/prescription-create-form.component';
import { StringsLoader } from '@prescriptions/misc';
import { PrescriptionsDataService, PrescriptionsFacade } from '@prescriptions/services';
import { Prescription } from '@prescriptions/types';

import { ConfirmDialogComponent } from '@shared/shared-confirm/components';
import { ConfirmDialogData } from '@shared/shared-confirm/types';
import { TableActionComponent, TableCellLoaderComponent, TableFiltersComponent } from '@shared/shared-table/components';
import { ExpandableRowAnimation, FiltersToggleExpandAnimation } from '@shared/shared-table/misc';
import { TableRowExpanderComponentBase } from '@shared/shared-table/misc/table-row-expander.component-base';
import { TableAction } from '@shared/shared-table/types';

import { PrescriptionsListHelperService } from './prescriptions-list-helper.service';

export interface PrescriptionsListComponent extends StringsLoader {}

@Component({
  selector: 'yht-prescriptions-list',
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
    PrescriptionDosagesRowComponent,
    SpinnerComponent,
    TableActionComponent,
    TableCellLoaderComponent,
    TableFiltersComponent
  ],
  providers: [PrescriptionsDataService, PrescriptionsFacade, PrescriptionsListHelperService],
  templateUrl: './prescriptions-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [ExpandableRowAnimation(), FiltersToggleExpandAnimation()]
})
@ClassExtender([StringsLoader])
export class PrescriptionsListComponent extends TableRowExpanderComponentBase<Prescription> {
  displayedColumns = [
    'readable_id',
    'prescription_code',
    'doctor__user__first_name',
    'doctor__user__last_name',
    'patient__user__first_name',
    'patient__user__last_name',
    'issue_date',
    'expiry_date',
    'description'
  ];

  userRole = UserRole;

  protected constEndColumns = ['actions'];

  actions: TableAction[] = [
    {
      action: (prescription: Prescription) => this.deletePrescription(prescription),
      icon: 'delete',
      label: this.strings.actions.delete.label,
      permissions: [UserRole.ADMIN, UserRole.DOCTOR]
    }
  ];

  constructor(
    protected cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private prescriptionsFacade: PrescriptionsFacade,
    private prescriptionsListHelper: PrescriptionsListHelperService
  ) {
    super(cdr);
  }

  protected initColumns(): void {
    this.columns = this.prescriptionsListHelper.getColumns();
  }

  getData(refreshView = false): void {
    if (refreshView) {
      this.cdr.markForCheck();
    }
    this.loading = true;
    this.prescriptionsFacade.getPrescriptions(this.listParams).subscribe({
      next: resp => {
        this.data = resp.results;
        this.updatePagination(resp.count);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.handleError('[BŁĄD] Pobieranie recept', error);
      }
    });
  }

  private deletePrescription(prescription: Prescription): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          cancelLabel: this.commonStrings.no,
          confirmLabel: this.commonStrings.yes,
          content: sprintf(this.strings.actions.delete.confirm.content, prescription.readable_id),
          onConfirm: () => this.prescriptionsFacade.deletePrescription(prescription.id),
          successMessage: sprintf(this.strings.actions.delete.confirm.succeed, prescription.readable_id),
          title: this.strings.actions.delete.confirm.title
        } as ConfirmDialogData
      })
      .afterClosed()
      .subscribe(prescriptionDeleted => {
        if (prescriptionDeleted) {
          this.getData(true);
        }
      });
  }

  openCreateFormDialog(): void {
    this.dialog
      .open<PrescriptionCreateFormComponent, Prescription, Prescription>(PrescriptionCreateFormComponent)
      .afterClosed()
      .subscribe(prescriptionAdded => {
        if (prescriptionAdded) {
          this.getData(true);
        }
      });
  }
}
