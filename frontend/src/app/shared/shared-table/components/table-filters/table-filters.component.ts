import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { ClassExtender, handleRequestErrors, isNully } from '@core/misc';
import { CustomObject } from '@core/types';

import { FormFieldSwitcherComponent } from '@shared/shared-form/components';
import { FormComponentBase } from '@shared/shared-form/misc';
import { DateSuffixes, FormField, FormFieldTypes } from '@shared/shared-form/types';
import { ListHelper, StringsLoader } from '@shared/shared-table/misc';
import { TableColumn } from '@shared/shared-table/types';

export interface TableFiltersComponent extends FormComponentBase, StringsLoader {}

@Component({
  selector: 'yht-table-filters',
  standalone: true,
  imports: [CommonModule, FormFieldSwitcherComponent, MatButtonModule, ReactiveFormsModule],
  templateUrl: './table-filters.component.html',
  styleUrl: './table-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class TableFiltersComponent extends FormComponentBase implements OnInit {
  @Input() columns: TableColumn[];

  private _httpError: HttpErrorResponse;

  @Input() set httpError(httpError: HttpErrorResponse) {
    this._httpError = httpError;
    if (httpError) {
      handleRequestErrors.call(this, httpError, this.form);
    }
  }
  @Output() filtersChanged = new EventEmitter<CustomObject>();

  extraFiltersVisible = false;

  get hasExtraFilters(): boolean {
    return this.columns.some(c => c.filter.extra);
  }

  get httpError(): HttpErrorResponse {
    return this._httpError;
  }

  constructor(protected override cdr: ChangeDetectorRef) {
    super(cdr);
  }

  ngOnInit(): void {
    this.prepareFields();
    this.prepareForm();
  }

  private prepareFields(): void {
    this.fieldNames = this.columns.map(col => col.name);
    this.fields = new Map(
      this.columns
        .filter(column => !column.filter.omit)
        .map(column => {
          const idPrefix = 'table-filter-form';
          const field: FormField = {
            idPrefix,
            label: column.label,
            name: column.name,
            placeholder: column.filter.placeholder,
            type: column.filter.type
          };

          if (column.filter.type === FormFieldTypes.SELECT || column.filter.type === FormFieldTypes.MULTISELECT) {
            field.data = column.data;
          }

          if (column.filter.type === FormFieldTypes.BOOLEAN) {
            field.data = column.data || ListHelper.getDefaultRadioBooleanData();
          }

          return [column.name, field];
        })
    );
  }

  isExtraFilter(fieldName: string): boolean {
    return this.columns.find(column => column.name === fieldName).filter.extra === true;
  }

  toggleExtraFilters(): void {
    this.extraFiltersVisible = !this.extraFiltersVisible;
  }

  private prepareFilterData(): CustomObject {
    const formValue = { ...this.form.value };

    Object.keys(formValue).forEach(fieldName => {
      if (isNully(formValue[fieldName])) {
        delete formValue[fieldName];
      }

      const column = this.columns.find(col => col.name === fieldName);
      if (column) {
        const filterType = column.filter.type;
        if (filterType === FormFieldTypes.DATE_RANGE) {
          const afterDate = this.form.value[`${column.name}_${DateSuffixes.AFTER}`];
          const beforeDate = this.form.value[`${column.name}_${DateSuffixes.BEFORE}`];

          if (isNully(afterDate)) {
            delete formValue[`${column.name}_${DateSuffixes.AFTER}`];
          }

          if (isNully(beforeDate)) {
            delete formValue[`${column.name}_${DateSuffixes.BEFORE}`];
          }
        }
      }
    });

    return formValue;
  }

  submit(event: Event): void {
    event.preventDefault();

    const filterData = this.prepareFilterData();
    this.filtersChanged.emit(filterData);
  }

  clear(): void {
    this.form.reset();
    this.filtersChanged.emit();
  }
}
