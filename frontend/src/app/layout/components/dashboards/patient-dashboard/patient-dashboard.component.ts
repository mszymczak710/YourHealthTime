import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { UserAuthData } from '@auth/types';

import { SpinnerComponent } from '@core/components';
import { ClassExtender } from '@core/misc';
import { ToastService } from '@core/services';

import { CountriesDataService, CountriesFacade } from '@dictionaries/countries/services';

import { StringsLoader } from '@layout/misc';

import { PatientHelper } from '@roles/patients/misc';
import { PatientsDataService, PatientsFacade } from '@roles/patients/services';
import { Patient } from '@roles/patients/types';

import { FormFieldSwitcherComponent } from '@shared/shared-form/components';
import { FormComponentBase } from '@shared/shared-form/misc';
import { FormFields } from '@shared/shared-form/types';

export interface PatientDashboardComponent extends StringsLoader {}

@Component({
  selector: 'yht-patient-dashboard',
  standalone: true,
  imports: [CommonModule, FormFieldSwitcherComponent, MatButtonModule, MatCardModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './patient-dashboard.component.html',
  providers: [CountriesDataService, CountriesFacade, PatientsDataService, PatientsFacade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class PatientDashboardComponent extends FormComponentBase implements OnInit {
  @Input() user: UserAuthData;

  addressFields: FormFields;
  userFields: FormFields;
  readonlyMode: boolean;

  readonly addressFieldNames = ['street', 'house_number', 'apartment_number', 'post_code', 'city', 'country'];
  readonly fieldNames = ['pesel', 'birth_date', 'gender', 'phone_number'];
  readonly userFieldNames = ['first_name', 'last_name', 'email'];

  private patient: Patient;

  get addressForm(): UntypedFormGroup {
    return this.form.get('address') as UntypedFormGroup;
  }

  get userForm(): UntypedFormGroup {
    return this.form.get('user') as UntypedFormGroup;
  }

  constructor(
    protected cdr: ChangeDetectorRef,
    private countriesFacade: CountriesFacade,
    private patientsFacade: PatientsFacade,
    private toastService: ToastService
  ) {
    super(cdr);
  }

  ngOnInit(): void {
    this.getData();
  }

  private getData(): void {
    this.patientsFacade.getPatient(this.user.profile_id).subscribe(patient => {
      this.patient = patient;
      this.initForm();
      this.cdr.detectChanges();
    });
  }

  private prepareFields(): void {
    const idPrefix = 'patient-edit-form';
    this.addressFields = PatientHelper.prepareAddressFields(idPrefix, this.countriesFacade);
    this.fields = PatientHelper.prepareFields(idPrefix);
    this.userFields = PatientHelper.prepareUserFields(idPrefix);
  }

  private setData(): void {
    this.setFieldsValues(this.patient);
    this.setFieldsValues(this.patient.user, this.userFields);
    this.setFieldsValues(this.patient.address, this.addressFields);
  }

  setReadonlyMode(readonly = true): void {
    this.readonlyMode = readonly;

    if (readonly) {
      this.setFieldsReadonly(readonly, this.userFields);
    }

    this.setFieldsReadonly(readonly, this.fields, ['phone_number']);
    this.setFieldsReadonly(readonly, this.addressFields);
  }

  private initForm(): void {
    this.prepareFields();
    this.setReadonlyMode();
    this.setData();
    this.prepareForm();
    this.addGroupToForm('user', this.userFields);
    this.addGroupToForm('address', this.addressFields);
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
        this.saving = false;
        this.setReadonlyMode();
        this.patient = patient;
        this.toastService.showSuccessMessage(this.strings.dashboard.patient.edit.succeed);
        this.cdr.markForCheck();
      },
      error: error => {
        this.handleError(error);
      }
    });
  }

  cancel(): void {
    this.setReadonlyMode();
    this.resetForm();
  }

  private resetForm(): void {
    this.form.reset(this.patient);
    this.userForm.reset(this.patient.user);
    this.addressForm.reset(this.patient.address);
  }
}
