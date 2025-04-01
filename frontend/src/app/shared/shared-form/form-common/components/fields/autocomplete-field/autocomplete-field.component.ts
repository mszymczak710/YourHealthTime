import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { OrderingType } from '@core/types';

import { AutocompleteComponent } from '@shared/shared-form/autocomplete/components';
import { FieldComponentBase } from '@shared/shared-form/form-common/misc';
import { FormFieldAutocompleteData } from '@shared/shared-form/form-common/types';

@Component({
  selector: 'wvw-autocomplete-field',
  standalone: true,
  imports: [AutocompleteComponent, ReactiveFormsModule],
  templateUrl: './autocomplete-field.component.html',
  styleUrl: './autocomplete-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutocompleteFieldComponent extends FieldComponentBase {
  get fieldData(): FormFieldAutocompleteData {
    return this.field?.data;
  }

  get ordering(): OrderingType[] {
    const fieldName = this.field?.data?.optionLabelKey;
    return this.field?.data?.ordering ?? [{ column: fieldName, direction: 'asc' }];
  }
}
