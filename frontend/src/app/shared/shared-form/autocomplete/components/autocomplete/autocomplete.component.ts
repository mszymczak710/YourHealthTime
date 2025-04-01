import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  forwardRef
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteActivatedEvent,
  MatAutocompleteModule,
  MatAutocompleteTrigger
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';

import lodashIsObject from 'lodash/isObject';
import { Observable, Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, exhaustMap, filter, map, switchMap, tap } from 'rxjs/operators';
import { sprintf } from 'sprintf-js';

import { SpinnerComponent } from '@core/components';
import { ClassExtender, StringsLoader } from '@core/misc';
import { NestedValuePipe } from '@core/pipes';
import { ListParams, OrderingType, isListResponse } from '@core/types';

import { environmentBase } from '@environments/environment-base';

import { OptionsScrollDirective } from '@shared/shared-form/autocomplete/directives';
import { AutocompleteDataSourceFunction } from '@shared/shared-form/autocomplete/types';
import { RequiredMarkComponent } from '@shared/shared-form/form-common/components/required-mark/required-mark.component';
import { FormField, FormFieldOption } from '@shared/shared-form/form-common/types';

export interface AutocompleteComponent extends StringsLoader {}

@Component({
  selector: 'wvw-autocomplete',
  standalone: true,
  imports: [
    FormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    OptionsScrollDirective,
    ReactiveFormsModule,
    RequiredMarkComponent,
    SpinnerComponent
  ],
  templateUrl: './autocomplete.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class AutocompleteComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() dataSourceFunction: AutocompleteDataSourceFunction<any>;
  @Input() disabled: boolean;
  @Input() field: FormField;
  @Input() fieldId: string;
  @Input() label: string;
  @Input()
  set minHintChars(val: number) {
    this._minHintChars = val ?? environmentBase.autocomplete.minHintChars;
  }
  get minHintChars(): number {
    return this._minHintChars;
  }
  private _minHintChars: number;
  @Input() optionLabelFn: (val: any) => string;
  @Input() optionLabelKey: string;
  @Input() optionValueKey: string;
  @Input() ordering: OrderingType[];
  @Input() placeholder: string;
  @Input() readonly = false;
  @Input() required = false;

  @ViewChildren(MatTooltip) optionTooltips: QueryList<MatTooltip>;
  @ViewChild(MatAutocomplete) private readonly autocompleteRef: MatAutocomplete;
  @ViewChild(MatAutocompleteTrigger) private readonly autocompleteTrigger: MatAutocompleteTrigger;

  private nestedValuePipe = new NestedValuePipe();

  loading = false;
  notEnoughChars = false;
  optionNotFound = false;
  options: FormFieldOption[] = [];
  value: FormFieldOption | string;

  private params = new ListParams();

  private newPageSubject = new Subject<void>();
  private phraseSubject = new Subject<string>();

  private dataSourceSubscription: Subscription;
  private newPageSubscription: Subscription;

  onChange: any = () => {};
  onTouch: any = () => {};

  get debounce(): number {
    return environmentBase.autocomplete.debounce;
  }

  get limit(): number {
    return environmentBase.autocomplete.limit;
  }

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initDataSourceSubscription();
    this.initialNextPageSubscription();
  }

  ngOnDestroy(): void {
    this.dataSourceSubscription?.unsubscribe();
    this.newPageSubscription?.unsubscribe();
  }

  /**
   * Zwraca label opcji na podstawie podanego klucza (`optionLabelKey`). Działa również, gdy klucz wskazuje na zagnieżdżenie,
   * tzn. zawiera podwójne podkreślenia (`__`).
   *
   * @param option opcja wybrana z listy podpowiedzi
   */
  protected getOptionLabelByKey(option: FormFieldOption | unknown): string {
    return this.optionLabelKey ? this.nestedValuePipe.transform(option, this.optionLabelKey) : option.toString();
  }

  /**
   * Zwraca wartość opcji na podstawie podanego klucza (`optionValueKey`). Działa również, gdy klucz wskazuje na zagnieżdżenie,
   * tzn. zawiera podwójne podkreślenia (`__`).
   *
   * @param option opcja wybrana z listy podpowiedzi
   */
  protected getOptionValueByKey(option: FormFieldOption | unknown): unknown {
    return this.optionValueKey ? this.nestedValuePipe.transform(option, this.optionValueKey) : option;
  }

  /**
   * Zwraca wyświetlany tekst dla wybranej opcji.
   * Używane na liście podpowiedzi oraz w inpucie, po wybraniu opcji.
   *
   * @param option opcja w postaci obiektu typu `FormFieldOption` lub w postaci stringa
   */
  getOptionLabel(option: FormFieldOption | string): any | string {
    if (option) {
      if (typeof option === 'string') {
        return option;
      } else {
        if (this.optionLabelFn) {
          return this.optionLabelFn(option);
        } else if (this.optionLabelKey) {
          return this.getOptionLabelByKey(option);
        }
        return option.toString();
      }
    }

    return this.value;
  }

  writeValue(value: unknown): void {
    if (value) {
      this.notEnoughChars = false;
      let primitiveValue: any;
      if (lodashIsObject(value)) {
        primitiveValue = this.getOptionValueByKey(value);
        if (!this.options?.length) {
          this.options = [value];
        }
      } else {
        primitiveValue = value;
      }

      const option = this.options?.find(opt => this.getOptionValueByKey(opt) === primitiveValue);
      if (option) {
        this.value = option;
      } else {
        this.dataSourceSubscription = this.checkPhraseAndGetData(primitiveValue, true).subscribe(data => {
          // sprawdzanie isListResponse, tylko dla poprawnego typowania - tutaj pobierany powinien być tylko jeden obiekt
          this.loading = false;
          if (isListResponse(data)) {
            this.options = data.results;
          } else {
            this.options = data;
          }

          if (this.options.length) {
            this.value = this.options[0];
            this.cdr.markForCheck();
          }
        });
      }
    } else {
      this.value = value;
      this.phraseSubject.next('');
    }
  }

  registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.detectChanges();
  }

  private initDataSourceSubscription(): void {
    this.dataSourceSubscription = this.phraseSubject
      .pipe(
        debounceTime(this.debounce),
        distinctUntilChanged((val1, val2) => val1 === val2 && val2 !== ''),
        switchMap(phrase => this.checkPhraseAndGetData(phrase)),
        tap(data => {
          if (isListResponse(data)) {
            this.params.pagination.next = data.next;
          }
        }),
        map(data => (isListResponse(data) ? data.results : data))
      )
      .subscribe(options => {
        this.options = options;

        if (!this.notEnoughChars) {
          this.optionNotFound = !options?.length;
          this.loading = false;
        }

        this.cdr.detectChanges();
      });
  }

  private setFilters(phrase: string): void {
    const fieldName = this.optionLabelKey;
    this.params.filters = { [fieldName]: phrase };
  }

  private setOrdering(): void {
    if (this.ordering) {
      this.params.ordering = this.ordering;
    }
  }

  protected checkPhraseAndGetData(phraseOrPrimitiveValue: string, emitPrimitiveValue = false): Observable<any> {
    this.optionNotFound = false;

    if (phraseOrPrimitiveValue.length < this.minHintChars) {
      this.notEnoughChars = true;
      this.loading = false;

      return of([]);
    }

    this.loading = true;
    this.notEnoughChars = false;
    this.cdr.markForCheck();

    this.setFilters(phraseOrPrimitiveValue);
    this.setOrdering();

    this.params.pagination.reset(); // resetujemy offset dla nowych zapytań o frazę
    return this.dataSourceFunction(this.params, emitPrimitiveValue ? phraseOrPrimitiveValue : undefined);
  }

  private initialNextPageSubscription(): void {
    this.newPageSubscription = this.newPageSubject
      .pipe(
        filter(() => this.params.pagination.nextPageExists()),
        exhaustMap(() => {
          this.params.pagination.nextPage();
          return this.dataSourceFunction(this.params);
        })
      )
      .subscribe(data => {
        if (isListResponse(data)) {
          this.params.pagination.next = data.next;
          this.options = [...this.options, ...data.results];
          this.cdr.markForCheck();
        }
      });
  }

  autocompleteOpened(): void {
    if (this.autocompleteTrigger) {
      this.autocompleteTrigger['_resetActiveItem'] = () => {};
    }
  }

  optionSelected(option: FormFieldOption): void {
    this.hideAllTooltips();
    this.value = option;
    this.onChange(option);
    this.onTouch();
  }

  optionActivated(event: MatAutocompleteActivatedEvent): void {
    const keyManager = event.source._keyManager;
    const options = event.source.options;
    const optionTooltips = this.optionTooltips.toArray();
    this.hideAllTooltips();

    optionTooltips[keyManager.activeItemIndex]?.show();
    if (keyManager.activeItemIndex + 1 === options.length) {
      this.newPageSubject.next();
    }
  }

  onAutocompleteScroll(): void {
    this.newPageSubject.next();
  }

  onInput(value: string): void {
    if (!this.autocompleteRef.isOpen) {
      this.autocompleteTrigger.openPanel();
    }

    if (value.length < this.minHintChars) {
      this.notEnoughChars = true;
      this.options = [];
      return;
    } else {
      this.notEnoughChars = false;
    }

    this.phraseSubject.next(value);
  }

  getNotEnoughCharsLabel(): string {
    return sprintf(this.commonStrings.notEnoughChars, this.minHintChars);
  }

  onFocus(): void {
    if (!this.options.length && this.minHintChars === 0) {
      this.phraseSubject.next('');
    }
  }

  hideAllTooltips(): void {
    this.optionTooltips.toArray().forEach(tooltip => tooltip.hide());
  }
}
