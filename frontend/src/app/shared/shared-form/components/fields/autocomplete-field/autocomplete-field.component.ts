import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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

import { Observable, Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, exhaustMap, filter, map, switchMap, tap } from 'rxjs/operators';
import { sprintf } from 'sprintf-js';

import { SpinnerComponent } from '@core/components';
import { ClassExtender, StringsLoader } from '@core/misc';
import { NestedValuePipe } from '@core/pipes';
import { ListParams, OrderingType, isListResponse } from '@core/types';

import { environmentBase } from '@environments/environment-base';

import { RequiredMarkComponent } from '@shared/shared-form/components/required-mark/required-mark.component';
import { OptionsScrollDirective } from '@shared/shared-form/directives';
import { FieldComponentBase } from '@shared/shared-form/misc';
import { FormFieldAutocompleteData, FormFieldOption } from '@shared/shared-form/types';

export interface AutocompleteFieldComponent extends StringsLoader {}

@Component({
  selector: 'yht-autocomplete-field',
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
  templateUrl: './autocomplete-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class AutocompleteFieldComponent extends FieldComponentBase implements OnInit, OnDestroy {
  @ViewChildren(MatTooltip) optionTooltips: QueryList<MatTooltip>;
  @ViewChild(MatAutocomplete) private readonly autocompleteRef: MatAutocomplete;
  @ViewChild(MatAutocompleteTrigger) private readonly autocompleteTrigger: MatAutocompleteTrigger;

  private nestedValuePipe = new NestedValuePipe();

  loading = false;
  notEnoughChars = false;
  optionNotFound = false;
  options: FormFieldOption[] = [];

  private params = new ListParams();

  private newPageSubject = new Subject<void>();
  private phraseSubject = new Subject<string>();

  private dataSourceSubscription: Subscription;
  private newPageSubscription: Subscription;

  get debounce(): number {
    return environmentBase.autocomplete.debounce;
  }

  get limit(): number {
    return environmentBase.autocomplete.limit;
  }

  get fieldData(): FormFieldAutocompleteData {
    return this.field?.data;
  }

  get minHintChars(): number {
    return this.field?.data?.minHintChars ?? environmentBase.autocomplete.minHintChars;
  }

  get optionLabelKey(): string {
    return this.field?.data?.optionLabelKey;
  }

  get optionLabelFn(): string {
    return this.field?.data?.optionLabelFn;
  }

  get optionValueKey(): string {
    return this.field?.data?.optionValueKey;
  }

  get ordering(): OrderingType[] {
    const fieldName = this.field?.data?.optionLabelKey;
    return this.field?.data?.ordering ?? [{ column: fieldName, direction: 'asc' }];
  }

  constructor(protected cdr: ChangeDetectorRef) {
    super(cdr);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initDataSourceSubscription();
    this.initialNextPageSubscription();

    const initialValue = this.control.value;
    if (initialValue) {
      this.options = [initialValue];
    }
  }

  ngOnDestroy(): void {
    this.dataSourceSubscription?.unsubscribe();
    this.newPageSubscription?.unsubscribe();
  }

  private getOptionLabelFn(val: any): string {
    return this.field?.data?.optionLabelFn(val);
  }

  private dataSourceFunction(params: ListParams, id?: string): Observable<any> {
    return this.field?.data?.dataSourceFn(params, id);
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
          return this.getOptionLabelFn(option);
        } else if (this.optionLabelKey) {
          return this.getOptionLabelByKey(option);
        }
        return option.toString();
      }
    }

    return null;
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
    this.control.setValue(option);
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
