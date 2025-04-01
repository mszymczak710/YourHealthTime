import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, UntypedFormArray, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';

import { sprintf } from 'sprintf-js';

import { SpinnerComponent } from '@core/components';
import { ClassExtender } from '@core/misc';
import { ToastService } from '@core/services';
import { ListParams } from '@core/types';

import { MedicinesDataService, MedicinesFacade } from '@dictionaries/medicines/services';
import { Medicine } from '@dictionaries/medicines/types';

import { StringsLoader } from '@prescriptions/misc';
import { PrescriptionsDataService, PrescriptionsFacade } from '@prescriptions/services';
import { Dosage, Prescription } from '@prescriptions/types';

import { DoctorsDataService, DoctorsFacade } from '@roles/doctors/services';
import { Doctor } from '@roles/doctors/types';
import { PatientsDataService, PatientsFacade } from '@roles/patients/services';
import { Patient } from '@roles/patients/types';

import { FormFieldSwitcherComponent, FormListComponent } from '@shared/shared-form/form-common/components';
import { DialogFormCanDeactivate, FormComponentBase } from '@shared/shared-form/form-common/misc';
import {
  FormField,
  FormFieldAutocompleteData,
  FormFieldNumberData,
  FormFields,
  FormFieldTypes
} from '@shared/shared-form/form-common/types';

export interface PrescriptionCreateFormComponent
  extends DialogFormCanDeactivate<PrescriptionCreateFormComponent, Prescription>,
    FormComponentBase,
    StringsLoader {}

@Component({
  selector: 'wvw-prescription-create-form',
  standalone: true,
  imports: [
    CommonModule,
    FormFieldSwitcherComponent,
    FormListComponent,
    MatButtonModule,
    MatDialogModule,
    MatStepperModule,
    ReactiveFormsModule,
    SpinnerComponent
  ],
  templateUrl: './prescription-create-form.component.html',
  providers: [
    DoctorsDataService,
    DoctorsFacade,
    MedicinesDataService,
    MedicinesFacade,
    PatientsDataService,
    PatientsFacade,
    PrescriptionsDataService,
    PrescriptionsFacade
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([DialogFormCanDeactivate, StringsLoader])
export class PrescriptionCreateFormComponent extends FormComponentBase implements OnInit, AfterViewInit {
  @ViewChild(MatStepper) stepper: MatStepper;

  readonly dosagesFieldNames = ['amount', 'medicine', 'frequency'];
  readonly fieldNames = ['patient', 'doctor', 'description'];
  dosagesFields: FormFields;

  get formArray(): UntypedFormArray {
    return this.form.get('dosages') as UntypedFormArray;
  }

  constructor(
    protected override cdr: ChangeDetectorRef,
    protected dialogRef: MatDialogRef<PrescriptionCreateFormComponent, Prescription>,
    private doctorsFacade: DoctorsFacade,
    private medicinesFacade: MedicinesFacade,
    private patientsFacade: PatientsFacade,
    private prescriptionsFacade: PrescriptionsFacade,
    private toastService: ToastService
  ) {
    super(cdr);
  }

  ngOnInit(): void {
    this.dialogRef.addPanelClass('dialog-lg');
    this.handleClose();
    this.prepareFields();
    this.getFormListFieldsDefs();
    this.prepareForm();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  protected override prepareForm(): void {
    super.prepareForm();
    const dosagesArray = new UntypedFormArray([], { validators: Validators.required });
    this.form.addControl('dosages', dosagesArray);
  }

  private prepareFields(): void {
    const idPrefix = 'prescription-create-form';
    this.fields = new Map<string, FormField>([
      [
        'description',
        {
          idPrefix,
          label: this.strings.form.fields.description.label,
          name: 'description',
          placeholder: this.strings.form.fields.description.placeholder,
          required: true,
          type: FormFieldTypes.TEXTAREA
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
      ]
    ]);
  }

  private getFormListFieldsDefs(): void {
    const idPrefix = 'prescription-create-form-dosages';
    this.dosagesFields = new Map<string, FormField>([
      [
        'medicine',
        {
          data: {
            dataSourceFn: (params: ListParams) => {
              {
                const selectedMedicines = this.formArray.value.map((row: Dosage) => row.medicine);
                if (!params.filters.id_exclude) {
                  params.filters.id_exclude = [];
                }
                selectedMedicines.forEach((specialization: Medicine) => {
                  if (specialization) {
                    params.filters.id_exclude.push(specialization.id);
                  }
                });
                return this.medicinesFacade.getMedicines(params);
              }
            },
            optionLabelKey: 'name',
            optionValueKey: 'id',
            ordering: [{ column: 'name', direction: 'asc' }]
          } as FormFieldAutocompleteData<Medicine>,
          idPrefix,
          label: this.strings.form.fields.dosages.medicine.label,
          labelledBy: 'prescription-create-form-dosages-field-medicine',
          name: 'medicine',
          placeholder: this.strings.form.fields.dosages.medicine.placeholder,
          required: true,
          type: FormFieldTypes.AUTOCOMPLETE
        }
      ],
      [
        'amount',
        {
          data: {
            step: 0.5
          } as FormFieldNumberData,
          idPrefix,
          label: this.strings.form.fields.dosages.amount.label,
          labelledBy: 'prescription-create-form-dosages-field-amount',
          name: 'amount',
          placeholder: this.strings.form.fields.dosages.amount.placeholder,
          required: true,
          type: FormFieldTypes.INPUT_NUMBER
        }
      ],
      [
        'frequency',
        {
          idPrefix,
          label: this.strings.form.fields.dosages.frequency.label,
          labelledBy: 'prescription-create-form-dosages-field-frequency',
          name: 'frequency',
          placeholder: this.strings.form.fields.dosages.frequency.placeholder,
          required: true,
          type: FormFieldTypes.INPUT
        }
      ]
    ]);
  }

  getFieldCssClass(fieldName: string): string {
    switch (fieldName) {
      case 'description':
        return 'col-12';
      default:
        return 'col-6';
    }
  }

  isPreviousButtonVisible(): boolean {
    return this.stepper.selectedIndex > 0;
  }

  isNextButtonVisible(): boolean {
    return this.stepper.selectedIndex < this.stepper.steps.length - 1;
  }

  onPreviousButtonClick(): void {
    this.stepper.previous();
  }

  onNextButtonClick(): void {
    this.stepper.next();
  }

  submit(event: Event): void {
    event.preventDefault();
    this.saving = true;

    const formData = this.form.value;

    const dosages = this.formArray.value.map((dosage: Dosage) => ({
      ...dosage,
      medicine: dosage.medicine.id
    }));

    const data = {
      ...formData,
      doctor: formData.doctor.id,
      dosages,
      patient: formData.patient.id
    };
    this.prescriptionsFacade.createPrescription(data).subscribe({
      next: prescription => {
        this.dialogRef.close(prescription);
        this.toastService.showSuccessMessage(this.strings.actions.create.succeed);
      },
      error: error => {
        this.handleError(error);
      }
    });
  }
}
