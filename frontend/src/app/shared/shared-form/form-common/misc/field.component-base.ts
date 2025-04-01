import { ChangeDetectorRef, Directive, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import { Subscription } from 'rxjs';

import { commonStrings } from '@core/misc';

import { environmentBase } from '@environments/environment-base';

import { strings } from '@shared/shared-form/form-common/misc';
import { FormField } from '@shared/shared-form/form-common/types';

@Directive()
export class FieldComponentBase implements OnInit, OnDestroy {
  @Input() control: UntypedFormControl;
  @Input() field: FormField;

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
  protected findFieldPath(form: UntypedFormGroup, fieldName: string, parentPath = ''): string | null {
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
  protected getRootFormGroup(control: UntypedFormControl | UntypedFormGroup): UntypedFormGroup | null {
    let parent = control.parent;
    while (parent instanceof UntypedFormGroup) {
      if (!parent.parent) {
        return parent; // Zwracamy najwyższy FormGroup
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

    const fieldPath = this.findFieldPath(form, fieldName);
    if (!fieldPath) {
      return null;
    }

    const control = form.get(fieldPath) as UntypedFormControl;
    return this.getErrorMessageFromControl(control, fieldPath);
  }

  protected getErrorMessageFromControl(control: UntypedFormControl, fieldPath: string): string | null {
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
    if (control.errors['email']) {
      return commonStrings.errors.form.email;
    }
    return null;
  }
}
