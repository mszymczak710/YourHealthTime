import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { RequiredMarkComponent } from '@shared/shared-form/form-common/components/required-mark/required-mark.component';
import { NumberFieldComponentBase } from '@shared/shared-form/form-common/misc';

@Component({
  selector: 'wvw-input-number-field',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, RequiredMarkComponent],
  templateUrl: './input-number-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputNumberFieldComponent extends NumberFieldComponentBase {}
