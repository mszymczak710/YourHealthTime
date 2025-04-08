import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { UserAuthData } from '@auth/types';

import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@layout/misc';

import { NursesDataService, NursesFacade } from '@roles/nurses/services';
import { Nurse } from '@roles/nurses/types';

import { FormFieldSwitcherComponent } from '@shared/shared-form/components';
import { FormComponentBase } from '@shared/shared-form/misc';
import { FormField, FormFieldTypes } from '@shared/shared-form/types';

export interface NurseDashboardComponent extends StringsLoader {}

@Component({
  selector: 'yht-nurse-dashboard',
  standalone: true,
  imports: [CommonModule, FormFieldSwitcherComponent, MatButtonModule, MatCardModule, ReactiveFormsModule],
  templateUrl: './nurse-dashboard.component.html',
  providers: [NursesDataService, NursesFacade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class NurseDashboardComponent extends FormComponentBase implements OnInit {
  @Input() user: UserAuthData;

  readonly fieldNames = ['user__first_name', 'user__last_name', 'user__email', 'nursing_license_number'];

  private nurse: Nurse;

  constructor(
    protected cdr: ChangeDetectorRef,
    private nursesFacade: NursesFacade
  ) {
    super(cdr);
  }

  ngOnInit(): void {
    this.getData();
  }

  private getData(): void {
    this.nursesFacade.getNurse(this.user.profile_id).subscribe(nurse => {
      this.nurse = nurse;
      this.initForm();
      this.cdr.detectChanges();
    });
  }

  private initForm(): void {
    this.prepareFields();
    this.setFieldsReadonly(true);
    this.setFieldsValues(this.nurse);
    this.prepareForm();
  }

  private prepareFields(): void {
    const idPrefix = 'nurse-form';
    this.fields = new Map<string, FormField>([
      [
        'user__first_name',
        {
          idPrefix,
          label: this.strings.dashboard.nurse.form.fields.user.first_name.label,
          name: 'user__first_name',
          type: FormFieldTypes.INPUT
        }
      ],
      [
        'user__last_name',
        {
          idPrefix,
          label: this.strings.dashboard.nurse.form.fields.user.last_name.label,
          name: 'user__last_name',
          type: FormFieldTypes.INPUT
        }
      ],
      [
        'user__email',
        {
          idPrefix,
          label: this.strings.dashboard.nurse.form.fields.user.email.label,
          name: 'user__email',
          type: FormFieldTypes.EMAIL
        }
      ],
      [
        'nursing_license_number',
        {
          idPrefix,
          label: this.strings.dashboard.nurse.form.fields.nursing_license_number.label,
          name: 'nursing_license_number',
          type: FormFieldTypes.INPUT
        }
      ]
    ]);
  }
}
