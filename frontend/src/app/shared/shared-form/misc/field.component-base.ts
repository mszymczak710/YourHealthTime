import { ChangeDetectorRef, Directive, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import { Subscription } from 'rxjs';
import { sprintf } from 'sprintf-js';

import { commonStrings, isNully } from '@core/misc';

import { environmentBase } from '@environments/environment-base';

import { strings } from '@shared/shared-form/misc';
import { FormField } from '@shared/shared-form/types';

@Directive()
export class FieldComponentBase implements OnInit, OnDestroy {
  @Input() arrayName: string;
  @Input() control: UntypedFormControl;
  @Input() field: FormField;
  @Input() index: number;

  protected controlStatusSubscription: Subscription;

  get placeholder(): string {
    return this.field.readonly ? environmentBase.emptyPlaceholder : this.field.placeholder || strings.input.placeholder;
  }

  constructor(@Optional() protected cdr?: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initListenerOnStatusChanged();
  }

  ngOnDestroy(): void {
    this.controlStatusSubscription?.unsubscribe();
  }

  protected initListenerOnStatusChanged(): void {
    if (this.control && this.field) {
      this.setFieldErrors();
      this.controlStatusSubscription = this.control.statusChanges.subscribe(() => {
        this.setFieldErrors();
      });
    }
  }

  private setFieldErrors(): void {
    this.field.errors = this.getErrorMessage(this.field.name);
    this.cdr.markForCheck();
  }

  getFieldId(): string {
    return `${this.field.idPrefix}-field-${this.field.name}`;
  }

  /**
   * Rekurencyjnie przeszukuje FormGroup i zwraca pełną ścieżkę pola.
   */
  private findFieldPath(form: UntypedFormGroup, fieldName: string, parentPath = ''): string | null {
    for (const key of Object.keys(form.controls)) {
      const control = form.get(key);

      if (control instanceof UntypedFormGroup) {
        // Rekurencyjnie przeszukujemy zagnieżdżoną grupę
        const fieldPath = this.findFieldPath(control, fieldName, `${parentPath}${key}.`);
        if (fieldPath) {
          return fieldPath;
        }
      } else if (key === fieldName) {
        // Znaleziono pole, zwracamy jego pełną ścieżkę
        return `${parentPath}${fieldName}`;
      }
    }

    return null;
  }

  /**
   * Sprawdza, czy kontrolka ma nadrzędne FormGroup.
   * Jeśli tak, zwraca najwyższy FormGroup w hierarchii.
   */
  private getRootFormGroup(control: UntypedFormControl | UntypedFormGroup): UntypedFormGroup | null {
    let parent = control.parent;

    while (parent) {
      if (parent instanceof UntypedFormGroup && !parent.parent) {
        return parent;
      }
      parent = parent.parent;
    }

    return null;
  }

  protected getErrorMessage(fieldName: string): string | null {
    const form = this.getRootFormGroup(this.control);
    if (!form) {
      return null;
    }

    const fieldPath = this.findFieldPath(form, fieldName) || fieldName;

    let control: UntypedFormControl | null = null;

    if (this.arrayName && !isNully(this.index)) {
      const formArray = form.get(this.arrayName);
      if (formArray.get([this.index]) instanceof UntypedFormGroup) {
        const group = formArray.get([this.index]) as UntypedFormGroup;
        control = group.get(fieldName) as UntypedFormControl;
      }
    } else {
      const fieldPath = this.findFieldPath(form, fieldName);
      control = form.get(fieldPath) as UntypedFormControl;
    }

    return this.getErrorMessageFromControl(control, fieldPath);
  }

  private getErrorMessageFromControl(control: UntypedFormControl, fieldPath: string): string | null {
    if (!control || !control.errors) {
      return null;
    }

    if (typeof control.errors[fieldPath] === 'string') {
      return control.errors[fieldPath];
    }
    if (control.errors['required']) {
      return commonStrings.errors.form.required;
    }
    if (control.errors['matDatepickerParse']) {
      return commonStrings.errors.form.matDatepickerParse;
    }
    if (control.errors['matTimepickerParse']) {
      return commonStrings.errors.form.matTimepickerParse;
    }
    if (control.errors['min']) {
      return sprintf(commonStrings.errors.form.min, control.getError('min').min);
    }
    if (control.errors['max']) {
      return sprintf(commonStrings.errors.form.max, control.getError('max').max);
    }
    if (control.errors['email']) {
      return commonStrings.errors.form.email;
    }
    return null;
  }
}
