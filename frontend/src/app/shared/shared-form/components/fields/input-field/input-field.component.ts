import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { RequiredMarkComponent } from '@shared/shared-form/components/required-mark/required-mark.component';
import { FieldComponentBase } from '@shared/shared-form/misc';
import { FormFieldTypes } from '@shared/shared-form/types';

@Component({
  selector: 'yht-input-field',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, ReactiveFormsModule, RequiredMarkComponent],
  templateUrl: './input-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputFieldComponent extends FieldComponentBase {
  formFieldTypes = FormFieldTypes;
  hide = true;

  togglePasswordIcon(): void {
    this.hide = !this.hide;
  }
}
