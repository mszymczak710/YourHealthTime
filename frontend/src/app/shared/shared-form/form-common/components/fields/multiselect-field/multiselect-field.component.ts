import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { RequiredMarkComponent } from '@shared/shared-form/form-common/components/required-mark/required-mark.component';
import { SelectFieldComponentBase } from '@shared/shared-form/form-common/misc';

@Component({
  selector: 'wvw-multiselect-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, ReactiveFormsModule, RequiredMarkComponent],
  templateUrl: './multiselect-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiselectFieldComponent extends SelectFieldComponentBase {}
