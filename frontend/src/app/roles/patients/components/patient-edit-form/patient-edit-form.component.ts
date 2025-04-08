import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { SpinnerComponent } from '@core/components';
import { ClassExtender } from '@core/misc';
import { ToastService } from '@core/services';

import { CountriesDataService, CountriesFacade } from '@dictionaries/countries/services';

import { PatientHelper, StringsLoader } from '@roles/patients/misc';
import { PatientsDataService, PatientsFacade } from '@roles/patients/services';
import { Patient } from '@roles/patients/types';

import { FormFieldSwitcherComponent } from '@shared/shared-form/components';
import { DialogFormCanDeactivate, FormComponentBase } from '@shared/shared-form/misc';
import { FormFields } from '@shared/shared-form/types';

export interface PatientEditFormComponent extends DialogFormCanDeactivate<PatientEditFormComponent, Patient>, StringsLoader {}

@Component({
  selector: 'yht-patient-edit-form',
  standalone: true,
  imports: [CommonModule, FormFieldSwitcherComponent, MatButtonModule, MatDialogModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './patient-edit-form.component.html',
  providers: [CountriesDataService, CountriesFacade, PatientsDataService, PatientsFacade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([DialogFormCanDeactivate, StringsLoader])
export class PatientEditFormComponent extends FormComponentBase implements OnInit {
  addressFields: FormFields;
  userFields: FormFields;

  readonly addressFieldNames = ['street', 'house_number', 'apartment_number', 'post_code', 'city', 'country'];
  readonly fieldNames = ['pesel', 'birth_date', 'gender', 'phone_number'];
  readonly userFieldNames = ['first_name', 'last_name', 'email'];

  get addressForm(): UntypedFormGroup {
    return this.form.get('address') as UntypedFormGroup;
  }

  get userForm(): UntypedFormGroup {
    return this.form.get('user') as UntypedFormGroup;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private patient: Patient,
    protected dialogRef: MatDialogRef<PatientEditFormComponent, Patient>,
    protected cdr: ChangeDetectorRef,
    private countriesFacade: CountriesFacade,
    private patientsFacade: PatientsFacade,
    private toastService: ToastService
  ) {
    super(cdr);
  }

  ngOnInit(): void {
    this.dialogRef.addPanelClass('dialog-xl');
    this.handleClose();
    this.initForm();
  }

  private initForm(): void {
    this.prepareFields();
    this.setReadonlyMode();
    this.setData();
    this.prepareForm();
    this.addGroupToForm('user', this.userFields);
    this.addGroupToForm('address', this.addressFields);
  }

  private setData(): void {
    this.setFieldsValues(this.patient);
    this.setFieldsValues(this.patient.user, this.userFields);
    this.setFieldsValues(this.patient.address, this.addressFields);
  }

  private setReadonlyMode(): void {
    this.setFieldsReadonly(false, this.fields, ['phone_number']);
    this.setFieldsReadonly(true, this.userFields);
  }

  private prepareFields(): void {
    const idPrefix = 'patient-edit-form';
    this.addressFields = PatientHelper.prepareAddressFields(idPrefix, this.countriesFacade);
    this.fields = PatientHelper.prepareFields(idPrefix);
    this.userFields = PatientHelper.prepareUserFields(idPrefix);
  }

  submit(event: Event): void {
    event.preventDefault();
    this.saving = true;

    const formData = this.form.value;

    const data: Partial<Patient> = {
      phone_number: formData.phone_number,
      address: {
        ...formData.address,
        country: formData.address.country.id
      }
    };

    this.patientsFacade.updatePatient(this.patient.id, data).subscribe({
      next: patient => {
        this.toastService.showSuccessMessage(this.strings.actions.edit.succeed);
        this.dialogRef.close(patient);
      },
      error: error => {
        this.handleError(error);
      }
    });
  }
}
