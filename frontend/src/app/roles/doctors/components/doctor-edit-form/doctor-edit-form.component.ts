import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { SpinnerComponent } from '@core/components';
import { ClassExtender } from '@core/misc';
import { ToastService } from '@core/services';
import { ListParams } from '@core/types';

import { SpecializationsDataService, SpecializationsFacade } from '@dictionaries/specializations/services';
import { Specialization } from '@dictionaries/specializations/types';

import { DoctorHelper, StringsLoader } from '@roles/doctors/misc';
import { DoctorsDataService, DoctorsFacade } from '@roles/doctors/services';
import { Doctor, DoctorPatchData } from '@roles/doctors/types';

import { FormFieldSwitcherComponent, FormListComponent } from '@shared/shared-form/components';
import { DialogFormCanDeactivate, FormComponentBase } from '@shared/shared-form/misc';
import { FormField, FormFieldAutocompleteData, FormFields, FormFieldTypes } from '@shared/shared-form/types';

type SpecializationRow = { specialization: Specialization };

export interface DoctorEditFormComponent extends DialogFormCanDeactivate<DoctorEditFormComponent, Doctor>, StringsLoader {}

@Component({
  selector: 'yht-doctor-edit-form',
  standalone: true,
  imports: [CommonModule, FormFieldSwitcherComponent, FormListComponent, MatButtonModule, MatDialogModule, SpinnerComponent],
  templateUrl: './doctor-edit-form.component.html',
  providers: [DoctorsDataService, DoctorsFacade, SpecializationsDataService, SpecializationsFacade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([DialogFormCanDeactivate, StringsLoader])
export class DoctorEditFormComponent extends FormComponentBase implements OnInit {
  formListFields: FormFields;
  userFields: FormFields;

  readonly fieldNames = ['job_execution_number'];
  readonly userFieldNames = ['first_name', 'last_name', 'email'];

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
    @Inject(MAT_DIALOG_DATA) private doctor: Doctor,
    protected cdr: ChangeDetectorRef,
    protected dialogRef: MatDialogRef<DoctorEditFormComponent, Doctor>,
    private doctorsFacade: DoctorsFacade,
    private specializationsFacade: SpecializationsFacade,
    private toastService: ToastService
  ) {
    super();
  }

  ngOnInit(): void {
    this.dialogRef.addPanelClass('dialog-lg');
    this.handleClose();
    this.prepareFields();
    this.setReadonlyMode();
    this.setData();
    this.prepareForm();
    this.addGroupToForm('user', this.userFields);
  }

  private prepareFields(): void {
    const idPrefix = 'doctor-edit-form';
    this.fields = DoctorHelper.prepareFields(idPrefix);
    this.userFields = DoctorHelper.prepareUserFields(idPrefix);
    this.formListFields = this.getFormListDef(idPrefix);
  }

  private setData(): void {
    this.setFieldsValues(this.doctor);
    this.setFieldsValues(this.doctor.user, this.userFields);
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
          label: this.strings.form.fields.specializations.specialization.label,
          labelledBy: 'doctor-edit-form-field-specialization',
          name: 'specialization',
          notEditable: true,
          placeholder: this.strings.form.fields.specializations.specialization.placeholder,
          required: true,
          type: FormFieldTypes.AUTOCOMPLETE
        }
      ]
    ]);
  }

  setReadonlyMode(readonly = true): void {
    if (readonly) {
      this.setFieldsReadonly(readonly, this.fields);
      this.setFieldsReadonly(readonly, this.userFields);
    }
  }

  submit(event: Event): void {
    event.preventDefault();
    this.saving = true;

    const data: DoctorPatchData = {
      specializations: this.form.value.specializations.map(value => value.specialization.id)
    };

    this.doctorsFacade.updateDoctor(this.doctor.id, data).subscribe({
      next: doctor => {
        this.dialogRef.close(doctor);
        this.toastService.showSuccessMessage(this.strings.actions.edit.succeed);
      },
      error: error => {
        this.handleError(error);
      }
    });
  }
}
