import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ClassExtender } from '@core/misc';

import { RequiredMarkComponent } from '@shared/shared-form/components/required-mark/required-mark.component';
import { DateFieldComponentBase, StringsLoader } from '@shared/shared-form/misc';

export interface DateFieldComponent extends StringsLoader {}

@Component({
  selector: 'yht-date-field',
  standalone: true,
  imports: [MatFormFieldModule, MatDatepickerModule, MatInputModule, MatTooltipModule, ReactiveFormsModule, RequiredMarkComponent],
  templateUrl: './date-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class DateFieldComponent extends DateFieldComponentBase implements OnInit {
  get placeholder(): string {
    return this.strings.date.placeholder;
  }
}
