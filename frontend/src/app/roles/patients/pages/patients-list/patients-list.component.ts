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

import { UserRole } from '@auth/types';

import { SpinnerComponent } from '@core/components/spinner/spinner.component';
import { ClassExtender } from '@core/misc';

import { PatientEditFormComponent } from '@roles/patients/components';
import { StringsLoader } from '@roles/patients/misc';
import { PatientsDataService, PatientsFacade } from '@roles/patients/services';
import { Patient } from '@roles/patients/types';

import { TableActionComponent, TableCellLoaderComponent, TableFiltersComponent } from '@shared/shared-table/components';
import { FiltersToggleExpandAnimation, TableComponentBase } from '@shared/shared-table/misc';
import { TableAction } from '@shared/shared-table/types';

import { PatientsListHelperService } from './patients-list-helper.service';

export interface PatientsListComponent extends StringsLoader {}

@Component({
  selector: 'yht-patients-list',
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
    TableActionComponent,
    TableCellLoaderComponent,
    TableFiltersComponent
  ],
  providers: [PatientsDataService, PatientsFacade, PatientsListHelperService],
  templateUrl: './patients-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [FiltersToggleExpandAnimation()]
})
@ClassExtender([StringsLoader])
export class PatientsListComponent extends TableComponentBase<Patient> {
  displayedColumns = [
    'readable_id',
    'user__first_name',
    'user__last_name',
    'user__email',
    'pesel',
    'birth_date',
    'gender',
    'phone_number',
    'address'
  ];

  private patient: Patient;

  protected constEndColumns = ['actions'];

  actions: TableAction[] = [
    {
      action: (patient: Patient) => this.getPatientInfo(patient),
      icon: 'pencil-outline',
      label: this.strings.actions.edit.label,
      permissions: [UserRole.ADMIN]
    }
  ];

  constructor(
    protected cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private patientsFacade: PatientsFacade,
    private patientsListHelper: PatientsListHelperService
  ) {
    super(cdr);
  }

  protected initColumns(): void {
    this.columns = this.patientsListHelper.getColumns();
  }

  getData(refreshView = false): void {
    if (refreshView) {
      this.cdr.markForCheck();
    }
    this.loading = true;
    this.patientsFacade.getPatients(this.listParams).subscribe({
      next: resp => {
        this.data = resp.results;
        this.updatePagination(resp.count);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.handleError('[BŁĄD] Pobieranie pacjentów', error);
      }
    });
  }

  private getPatientInfo(patient: Patient): void {
    this.patientsFacade.getPatient(patient.id).subscribe({
      next: patient => {
        this.patient = patient;
        this.openEditFormDialog(this.patient);
      }
    });
  }

  private openEditFormDialog(patient: Patient): void {
    this.dialog
      .open<PatientEditFormComponent, Patient, Patient>(PatientEditFormComponent, { data: patient })
      .afterClosed()
      .subscribe(patientUpdated => {
        if (patientUpdated) {
          this.getData(true);
        }
      });
  }
}
