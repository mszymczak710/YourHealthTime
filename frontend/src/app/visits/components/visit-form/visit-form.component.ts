import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { sprintf } from 'sprintf-js';

import { SpinnerComponent } from '@core/components';
import { ClassExtender } from '@core/misc';
import { ToastService } from '@core/services';
import { ListParams } from '@core/types';

import { DiseasesDataService, DiseasesFacade } from '@dictionaries/diseases/services';
import { Disease } from '@dictionaries/diseases/types';
import { OfficesDataService, OfficesFacade } from '@dictionaries/offices/services';
import { Office } from '@dictionaries/offices/types';

import { DoctorsDataService, DoctorsFacade } from '@roles/doctors/services';
import { Doctor } from '@roles/doctors/types';
import { PatientsDataService, PatientsFacade } from '@roles/patients/services';
import { Patient } from '@roles/patients/types';

import { FormFieldSwitcherComponent } from '@shared/shared-form/components';
import { DateFunctions, DialogFormCanDeactivate, FormComponentBase } from '@shared/shared-form/misc';
import { FormField, FormFieldAutocompleteData, FormFieldNumberData, FormFieldRadioData, FormFieldTypes } from '@shared/shared-form/types';

import { StringsLoader } from '@visits/misc';
import { VisitsDataService, VisitsFacade } from '@visits/services';
import { Visit, VisitSaveData } from '@visits/types';

export interface VisitFormComponent extends DialogFormCanDeactivate<VisitFormComponent, Visit>, FormComponentBase, StringsLoader {}

@Component({
  selector: 'yht-visit-form',
  standalone: true,
  imports: [CommonModule, FormFieldSwitcherComponent, MatButtonModule, MatDialogModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './visit-form.component.html',
  providers: [
    DiseasesDataService,
    DiseasesFacade,
    DoctorsDataService,
    DoctorsFacade,
    OfficesDataService,
    OfficesFacade,
    PatientsDataService,
    PatientsFacade,
    VisitsDataService,
    VisitsFacade
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([DialogFormCanDeactivate, StringsLoader])
export class VisitFormComponent extends FormComponentBase implements OnInit {
  readonly fieldNames: string[] = ['patient', 'doctor', 'date', 'hour', 'duration_in_minutes', 'is_remote', 'office', 'disease', 'notes'];

  get title(): string {
    return this.strings.actions[this.visit ? 'edit' : 'create'].title;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private visit: Visit,
    protected override cdr: ChangeDetectorRef,
    protected dialogRef: MatDialogRef<VisitFormComponent, Visit>,
    private diseasesFacade: DiseasesFacade,
    private doctorsFacade: DoctorsFacade,
    private officesFacade: OfficesFacade,
    private patientsFacade: PatientsFacade,
    private toastService: ToastService,
    private visitsFacade: VisitsFacade
  ) {
    super(cdr);
  }

  ngOnInit(): void {
    this.dialogRef.addPanelClass('dialog-xl');
    this.handleClose();
    this.prepareFields();
    this.setFieldsValues(this.visit);
    this.prepareForm();
  }

  private prepareFields(): void {
    const idPrefix = 'visit-form';
    this.fields = new Map<string, FormField>([
      [
        'date',
        {
          idPrefix,
          label: this.strings.form.fields.date.label,
          name: 'date',
          required: true,
          type: FormFieldTypes.DATE
        }
      ],
      [
        'hour',
        {
          idPrefix,
          label: this.strings.form.fields.hour.label,
          name: 'hour',
          required: true,
          type: FormFieldTypes.TIME
        }
      ],
      [
        'duration_in_minutes',
        {
          data: {
            max: 180,
            min: 5
          } as FormFieldNumberData,
          idPrefix,
          label: this.strings.form.fields.duration_in_minutes.label,
          name: 'duration_in_minutes',
          required: true,
          type: FormFieldTypes.INPUT_NUMBER,
          value: 5
        }
      ],
      [
        'is_remote',
        {
          data: {
            options: [true, false].map(value => {
              return { label: this.strings.form.fields.is_remote.options[value.toString()], value };
            })
          } as FormFieldRadioData,
          idPrefix,
          label: this.strings.form.fields.is_remote.label,
          name: 'is_remote',
          required: true,
          type: FormFieldTypes.BOOLEAN,
          value: false
        }
      ],
      [
        'disease',
        {
          data: {
            dataSourceFn: (params: ListParams) => this.diseasesFacade.getDiseases(params),
            optionLabelKey: 'name',
            optionValueKey: 'id'
          } as FormFieldAutocompleteData<Disease>,
          idPrefix,
          label: this.strings.form.fields.disease.label,
          name: 'disease',
          placeholder: this.strings.form.fields.disease.placeholder,
          type: FormFieldTypes.AUTOCOMPLETE
        }
      ],
      [
        'doctor',
        {
          data: {
            dataSourceFn: (params: ListParams) => this.doctorsFacade.getDoctors(params),
            optionLabelFn: (doctor: Doctor) =>
              sprintf(
                this.strings.form.fields.doctor.description,
                doctor.user.first_name,
                doctor.user.last_name,
                doctor.job_execution_number
              ),
            optionLabelKey: 'user__full_name',
            optionValueKey: 'id',
            ordering: [{ column: 'user__first_name', direction: 'asc' }]
          } as FormFieldAutocompleteData<Doctor>,
          idPrefix,
          label: this.strings.form.fields.doctor.label,
          name: 'doctor',
          placeholder: this.strings.form.fields.doctor.placeholder,
          required: true,
          type: FormFieldTypes.AUTOCOMPLETE
        }
      ],
      [
        'patient',
        {
          data: {
            dataSourceFn: (params: ListParams) => this.patientsFacade.getPatients(params),
            optionLabelFn: (patient: Patient) =>
              sprintf(this.strings.form.fields.patient.description, patient.user.first_name, patient.user.last_name, patient.pesel),
            optionLabelKey: 'user__full_name',
            optionValueKey: 'id',
            ordering: [{ column: 'user__first_name', direction: 'asc' }]
          } as FormFieldAutocompleteData<Patient>,
          idPrefix,
          label: this.strings.form.fields.patient.label,
          name: 'patient',
          placeholder: this.strings.form.fields.patient.placeholder,
          required: true,
          type: FormFieldTypes.AUTOCOMPLETE
        }
      ],
      [
        'office',
        {
          data: {
            dataSourceFn: (params: ListParams) => this.officesFacade.getOffices(params),
            optionLabelFn: (office: Office) =>
              sprintf(this.strings.form.fields.office.description, office.office_type.name, office.floor, office.room_number),
            optionLabelKey: 'office_type__name',
            optionValueKey: 'id'
          } as FormFieldAutocompleteData<Office>,
          idPrefix,
          label: this.strings.form.fields.office.label,
          name: 'office',
          placeholder: this.strings.form.fields.office.placeholder,
          required: true,
          type: FormFieldTypes.AUTOCOMPLETE
        }
      ],
      [
        'notes',
        {
          idPrefix,
          label: this.strings.form.fields.notes.label,
          name: 'notes',
          placeholder: this.strings.form.fields.notes.placeholder,
          type: FormFieldTypes.TEXTAREA
        }
      ]
    ]);
  }

  getFieldCssClass(fieldName: string): string {
    switch (fieldName) {
      case 'patient':
      case 'doctor':
      case 'office':
      case 'disease':
        return 'col-6';
      case 'notes':
        return 'col-12';
      default:
        return 'col-3';
    }
  }

  submit(event: Event): void {
    event.preventDefault();
    this.saving = true;

    const formData = { ...this.form.value };
    delete formData.hour;

    const data: VisitSaveData = {
      ...formData,
      date: DateFunctions.transformDateTimeToBackendFormat(formData.date, this.form.value.hour),
      disease: formData.disease ? formData.disease.id : null,
      doctor: formData.doctor.id,
      office: formData.office.id,
      patient: formData.patient.id
    };

    const operation = this.visit ? this.visitsFacade.updateVisit(this.visit.id, data) : this.visitsFacade.createVisit(data);

    operation.subscribe({
      next: visit => {
        this.dialogRef.close(visit);
        this.toastService.showSuccessMessage(this.strings.actions[this.visit ? 'edit' : 'create'].succeed);
      },
      error: error => {
        this.handleError(error);
      }
    });
  }
}
