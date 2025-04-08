import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { UserAuthData } from '@auth/types';

import { SpinnerComponent } from '@core/components';
import { ClassExtender } from '@core/misc';
import { ToastService } from '@core/services';
import { ListParams } from '@core/types';

import { SpecializationsDataService, SpecializationsFacade } from '@dictionaries/specializations/services';
import { Specialization } from '@dictionaries/specializations/types';

import { StringsLoader } from '@layout/misc';

import { DoctorHelper } from '@roles/doctors/misc';
import { DoctorsDataService, DoctorsFacade } from '@roles/doctors/services';
import { Doctor, DoctorPatchData } from '@roles/doctors/types';

import { FormFieldSwitcherComponent, FormListComponent } from '@shared/shared-form/components';
import { FormComponentBase } from '@shared/shared-form/misc';
import { FormField, FormFieldAutocompleteData, FormFieldTypes, FormFields } from '@shared/shared-form/types';

type SpecializationRow = { specialization: Specialization };

export interface DoctorDashboardComponent extends StringsLoader {}

@Component({
  selector: 'yht-doctor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormFieldSwitcherComponent,
    FormListComponent,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    SpinnerComponent
  ],
  templateUrl: './doctor-dashboard.component.html',
  providers: [DoctorsDataService, DoctorsFacade, SpecializationsDataService, SpecializationsFacade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class DoctorDashboardComponent extends FormComponentBase implements OnInit {
  @Input() user: UserAuthData;
  @ViewChild(FormListComponent) formListComponent: FormListComponent;

  formListFields: FormFields;
  userFields: FormFields;
  readonlyMode: boolean;

  readonly fieldNames = ['job_execution_number'];
  readonly userFieldNames = ['first_name', 'last_name', 'email'];

  private doctor: Doctor;

  get formArray(): UntypedFormArray {
    return this.form.get('specializations') as UntypedFormArray;
  }

  get userForm(): UntypedFormGroup {
    return this.form.get('user') as UntypedFormGroup;
  }

  get specializations(): Specialization[] {
    return this.doctor.specializations;
  }

  constructor(
    protected cdr: ChangeDetectorRef,
    private doctorsFacade: DoctorsFacade,
    private specializationsFacade: SpecializationsFacade,
    private toastService: ToastService
  ) {
    super(cdr);
  }

  ngOnInit(): void {
    this.getData();
  }

  private getData(): void {
    this.doctorsFacade.getDoctor(this.user.profile_id).subscribe(doctor => {
      this.doctor = doctor;
      this.initForm();
      this.cdr.detectChanges();
    });
  }

  private prepareFields(): void {
    const idPrefix = 'doctor-edit-form';
    this.fields = DoctorHelper.prepareFields(idPrefix);
    this.userFields = DoctorHelper.prepareUserFields(idPrefix);
    this.formListFields = this.getFormListDef(idPrefix);
  }

  private getFormListDef(idPrefix: string): FormFields {
    return new Map<string, FormField>([
      [
        'specialization',
        {
          data: {
            dataSourceFn: (params: ListParams) => {
              {
                const selectedSpecializations = this.formArray.value.map((row: SpecializationRow) => row.specialization);
                if (!params.filters.id_exclude) {
                  params.filters.id_exclude = [];
                }
                selectedSpecializations.forEach((specialization: Specialization) => {
                  if (specialization) {
                    params.filters.id_exclude.push(specialization.id);
                  }
                });
                return this.specializationsFacade.getSpecializations(params);
              }
            },
            optionLabelKey: 'name',
            optionValueKey: 'id'
          } as FormFieldAutocompleteData<Specialization>,
          idPrefix,
          label: this.strings.dashboard.doctor.form.fields.specializations.specialization.label,
          labelledBy: 'doctor-edit-form-field-specialization',
          name: 'specialization',
          notEditable: true,
          placeholder: this.strings.dashboard.doctor.form.fields.specializations.specialization.placeholder,
          required: true,
          type: FormFieldTypes.AUTOCOMPLETE
        }
      ]
    ]);
  }

  private setData(): void {
    this.setFieldsValues(this.doctor);
    this.setFieldsValues(this.doctor.user, this.userFields);
  }

  setReadonlyMode(readonly = true): void {
    this.readonlyMode = readonly;

    if (readonly) {
      this.setFieldsReadonly(readonly, this.fields);
      this.setFieldsReadonly(readonly, this.userFields);
    }
  }

  private initForm(): void {
    this.prepareFields();
    this.setReadonlyMode();
    this.setData();
    this.prepareForm();
    this.addGroupToForm('user', this.userFields);
  }

  submit(event: Event): void {
    event.preventDefault();
    this.saving = true;

    const data: DoctorPatchData = {
      specializations: this.form.value.specializations.map(value => value.specialization.id)
    };

    this.doctorsFacade.updateDoctor(this.doctor.id, data).subscribe({
      next: doctor => {
        this.saving = false;
        this.setReadonlyMode();
        this.doctor = doctor;
        this.toastService.showSuccessMessage(this.strings.dashboard.doctor.edit.succeed);
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
    this.formListComponent.removeAllRows();
    this.formListComponent.addRowsToFormArray();
    this.form.reset(this.doctor);
    this.userForm.reset(this.doctor.user);
  }
}
