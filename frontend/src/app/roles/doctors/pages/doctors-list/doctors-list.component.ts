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
import { ClassExtender } from '@core/misc';

import { DoctorSpecializationsRowComponent } from '@roles/doctors/components';
import { DoctorEditFormComponent } from '@roles/doctors/components/doctor-edit-form/doctor-edit-form.component';
import { StringsLoader } from '@roles/doctors/misc';
import { DoctorsDataService, DoctorsFacade } from '@roles/doctors/services';
import { Doctor } from '@roles/doctors/types';

import { ConfirmDialogComponent } from '@shared/shared-confirm/components';
import { ConfirmDialogData } from '@shared/shared-confirm/types';
import { TableActionComponent, TableCellLoaderComponent, TableFiltersComponent } from '@shared/shared-table/components';
import { ExpandableRowAnimation, FiltersToggleExpandAnimation } from '@shared/shared-table/misc';
import { TableRowExpanderComponentBase } from '@shared/shared-table/misc/table-row-expander.component-base';
import { TableAction } from '@shared/shared-table/types';

import { DoctorsListHelperService } from './doctors-list-helper.service';

export interface DoctorsListComponent extends StringsLoader {}

@Component({
  selector: 'yht-doctors-list',
  standalone: true,
  imports: [
    CommonModule,
    DoctorSpecializationsRowComponent,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    SpinnerComponent,
    TableActionComponent,
    TableCellLoaderComponent,
    TableFiltersComponent
  ],
  providers: [DoctorsDataService, DoctorsFacade, DoctorsListHelperService],
  templateUrl: './doctors-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [ExpandableRowAnimation(), FiltersToggleExpandAnimation()]
})
@ClassExtender([StringsLoader])
export class DoctorsListComponent extends TableRowExpanderComponentBase<Doctor> {
  displayedColumns = ['readable_id', 'user__first_name', 'user__last_name', 'user__email', 'job_execution_number'];

  protected constEndColumns = ['actions'];

  actions: TableAction[] = [
    {
      action: (doctor: Doctor) => this.openEditFormDialog(doctor),
      icon: 'pencil-outline',
      label: this.strings.actions.edit.label,
      permissions: [UserRole.ADMIN]
    },
    {
      action: (doctor: Doctor) => this.deleteDoctor(doctor),
      icon: 'delete',
      label: this.strings.actions.delete.label,
      permissions: [UserRole.ADMIN]
    }
  ];

  constructor(
    protected cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private doctorsFacade: DoctorsFacade,
    private doctorsListHelper: DoctorsListHelperService
  ) {
    super(cdr);
  }

  protected initColumns(): void {
    this.columns = this.doctorsListHelper.getColumns();
  }

  getData(refreshView = false): void {
    if (refreshView) {
      this.cdr.markForCheck();
    }
    this.loading = true;
    this.doctorsFacade.getDoctors(this.listParams).subscribe({
      next: resp => {
        this.data = resp.results;
        this.updatePagination(resp.count);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.handleError('[BŁĄD] Pobieranie lekarzy', error);
      }
    });
  }

  private deleteDoctor(doctor: Doctor): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          cancelLabel: this.commonStrings.no,
          confirmLabel: this.commonStrings.yes,
          content: sprintf(this.strings.actions.delete.confirm.content, doctor.readable_id),
          onConfirm: () => this.doctorsFacade.deleteDoctor(doctor.id),
          successMessage: sprintf(this.strings.actions.delete.confirm.succeed, doctor.readable_id),
          title: this.strings.actions.delete.confirm.title
        } as ConfirmDialogData
      })
      .afterClosed()
      .subscribe(doctorDeleted => {
        if (doctorDeleted) {
          this.getData(true);
        }
      });
  }

  openEditFormDialog(doctor: Doctor): void {
    this.dialog
      .open<DoctorEditFormComponent, Doctor, Doctor>(DoctorEditFormComponent, { data: doctor })
      .afterClosed()
      .subscribe(doctorUpdated => {
        if (doctorUpdated) {
          this.getData(true);
        }
      });
  }
}
