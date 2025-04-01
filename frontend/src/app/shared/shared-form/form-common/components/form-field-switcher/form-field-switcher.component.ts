import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

import {
  AutocompleteFieldComponent,
  DateFieldComponent,
  DateRangeFieldComponent,
  InputFieldComponent,
  InputNumberFieldComponent,
  MultiselectFieldComponent,
  NumberRangeFieldComponent,
  RadioBooleanFieldComponent,
  RecaptchaFieldComponent,
  SelectFieldComponent,
  TextareaFieldComponent,
  TimeFieldComponent
} from '@shared/shared-form/form-common/components/fields';
import { FormField, FormFieldTypes } from '@shared/shared-form/form-common/types';

@Component({
  selector: 'wvw-form-field-switcher',
  standalone: true,
  imports: [
    AutocompleteFieldComponent,
    DateFieldComponent,
    DateRangeFieldComponent,
    InputFieldComponent,
    InputNumberFieldComponent,
    MultiselectFieldComponent,
    NumberRangeFieldComponent,
    RadioBooleanFieldComponent,
    RecaptchaFieldComponent,
    SelectFieldComponent,
    TextareaFieldComponent,
    TimeFieldComponent
  ],
  templateUrl: './form-field-switcher.component.html',
  styleUrl: './form-field-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldSwitcherComponent {
  @Input() control: UntypedFormControl;
  @Input() field: FormField;

  formFieldTypes = FormFieldTypes;
}
