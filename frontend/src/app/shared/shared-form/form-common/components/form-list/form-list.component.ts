import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ClassExtender } from '@core/misc';

import { FormFieldSwitcherComponent, RequiredMarkComponent } from '@shared/shared-form/form-common/components';
import { StringsLoader } from '@shared/shared-form/form-common/misc';
import { FormField } from '@shared/shared-form/form-common/types';

export interface FormListComponent extends StringsLoader {}

@Component({
  selector: 'wvw-form-list',
  standalone: true,
  imports: [
    FormFieldSwitcherComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatTooltipModule,
    ReactiveFormsModule,
    RequiredMarkComponent
  ],
  templateUrl: './form-list.component.html',
  styleUrl: './form-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class FormListComponent implements OnInit {
  @Input() addButtonLabel: string;
  @Input() fieldsMap: Map<string, FormField>;
  @Input() form: UntypedFormGroup;
  @Input() formArrayName: string;
  @Input() items: any[];
  @Input() label: string;
  private _readonly: boolean;
  @Input()
  set readonly(value: boolean) {
    this._readonly = value;
    this.setFieldsReadonly(value);
  }
  get readonly(): boolean {
    return this._readonly;
  }
  @Input() required: boolean;

  get fields(): FormField[] {
    return Array.from(this.fieldsMap.values());
  }

  get formArray(): UntypedFormArray {
    return this.form.get(this.formArrayName) as UntypedFormArray;
  }

  ngOnInit(): void {
    this.addRowsToFormArray(this.items);
  }

  getFormGroup(index: number): UntypedFormGroup {
    return this.formArray.at(index) as UntypedFormGroup;
  }

  private setFieldsReadonly(readonly = true, fields = this.fieldsMap): void {
    fields.forEach((field, fieldName) => {
      fields.set(fieldName, { ...field, readonly: readonly });
    });
  }

  private prepareFormGroup(value?: any): UntypedFormGroup {
    const formControls: { [key: string]: UntypedFormControl } = {};

    this.fields.forEach(field => {
      const validators = field.validators ? [...field.validators] : [];

      if (field.required) {
        validators.push(Validators.required);
      }
      formControls[field.name] = new UntypedFormControl({ disabled: field.disabled, value }, validators);
    });

    return new UntypedFormGroup(formControls);
  }

  addRowsToFormArray(items: any[]): void {
    if (!items || !items.length) {
      return;
    }
    items.forEach(item => {
      this.addItem(item);
    });
  }

  addItem(value?: any): void {
    const group = this.prepareFormGroup(value);
    this.formArray.push(group);
  }

  removeAllRows(): void {
    this.formArray.clear();
  }

  removeItem(index: number): void {
    this.formArray.removeAt(index);
  }

  addButtonDisabled(): boolean {
    if (!this.formArray || !this.formArray.length) {
      return false;
    }
    const lastGroup = this.getFormGroup(this.formArray.length - 1);
    return lastGroup.invalid;
  }
}
