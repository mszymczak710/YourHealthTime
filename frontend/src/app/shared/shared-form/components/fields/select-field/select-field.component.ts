import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { RequiredMarkComponent } from '@shared/shared-form/components/required-mark/required-mark.component';
import { SelectFieldComponentBase } from '@shared/shared-form/misc';

@Component({
  selector: 'yht-select-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, ReactiveFormsModule, RequiredMarkComponent],
  templateUrl: './select-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectFieldComponent extends SelectFieldComponentBase {}
