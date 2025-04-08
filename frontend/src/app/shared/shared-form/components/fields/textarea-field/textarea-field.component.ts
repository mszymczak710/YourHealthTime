import { TextFieldModule } from '@angular/cdk/text-field';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { RequiredMarkComponent } from '@shared/shared-form/components/required-mark/required-mark.component';
import { FieldComponentBase } from '@shared/shared-form/misc';

@Component({
  selector: 'yht-textarea-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, RequiredMarkComponent, TextFieldModule],
  templateUrl: './textarea-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextareaFieldComponent extends FieldComponentBase {}
