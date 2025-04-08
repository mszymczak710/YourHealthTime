import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';

import { RequiredMarkComponent } from '@shared/shared-form/components/required-mark/required-mark.component';
import { FieldComponentBase } from '@shared/shared-form/misc';
import { FormFieldRadioData } from '@shared/shared-form/types';

@Component({
  selector: 'yht-radio-boolean-field',
  standalone: true,
  imports: [MatButtonToggleModule, MatFormFieldModule, ReactiveFormsModule, RequiredMarkComponent],
  templateUrl: './radio-boolean-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioBooleanFieldComponent extends FieldComponentBase implements AfterViewInit {
  get fieldData(): FormFieldRadioData {
    return this.field.data;
  }

  constructor(
    protected cdr: ChangeDetectorRef,
    private elRef: ElementRef
  ) {
    super(cdr);
  }

  ngAfterViewInit(): void {
    const optionsCount = this.fieldData?.options?.length || 1;
    this.elRef.nativeElement.style.setProperty('--toggle-count', optionsCount.toString());
  }
}
