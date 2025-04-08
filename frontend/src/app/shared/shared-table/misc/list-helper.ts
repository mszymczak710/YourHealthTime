import { CustomObject } from '@core/types';

import { FormFieldRadioData, FormFieldTypes } from '@shared/shared-form/types';
import { strings } from '@shared/shared-table/misc/strings';
import { TableColumn, TableColumnTypes, TableFilter } from '@shared/shared-table/types';

export class ListHelper {
  static getColumnDef(name: string, type: TableColumnTypes, strings: CustomObject, options?: Partial<TableColumn>): TableColumn {
    const defaultColumnOptions = ListHelper.getDefaultColumnOptions(type);
    const defaultFilter: TableFilter = {
      type: ListHelper.getFormFieldType(type),
      placeholder: ListHelper.getPlaceholder(name, strings),
      extra: false,
      omit: false
    };
    const label = ListHelper.getLabel(name, strings);

    return {
      ...defaultColumnOptions,
      ...options,
      data: options?.data,
      filter: Object.assign({}, defaultFilter, options?.filter),
      label,
      name,
      sortable: options?.sortable ?? true,
      styles: {
        ...(defaultColumnOptions.styles ?? {}),
        ...(options?.styles ?? {})
      },
      type
    } as TableColumn;
  }

  static getLabel(columnName: string, strings: CustomObject): string | null {
    return ListHelper.getFieldValue(columnName, strings, 'label');
  }

  static getPlaceholder(columnName: string, strings: CustomObject): string | null {
    return ListHelper.getFieldValue(columnName, strings, 'placeholder');
  }

  /**
   * Ogólna metoda do pobierania wartości `label` lub `placeholder` z `strings`.
   *
   * @param columnName - Nazwa kolumny w formacie "object__property"
   * @param strings - Obiekt z tłumaczeniami
   * @param field - Klucz do pobrania (`label` lub `placeholder`)
   * @returns Wartość `label` lub `placeholder`, lub `null`, jeśli nie znaleziono
   */
  private static getFieldValue(columnName: string, strings: CustomObject, field: 'label' | 'placeholder'): string | null {
    const fieldPath = columnName.split('__');
    let value = strings;

    for (const key of fieldPath) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return columnName;
      }
    }

    return typeof value === 'object' && field in value ? value[field] : null;
  }

  static getFormFieldType(columnType: TableColumnTypes): FormFieldTypes {
    switch (columnType) {
      case TableColumnTypes.BOOLEAN:
        return FormFieldTypes.BOOLEAN;
      case TableColumnTypes.DATE:
      case TableColumnTypes.DATETIME:
        return FormFieldTypes.DATE_RANGE;
      case TableColumnTypes.NUMBER:
        return FormFieldTypes.INPUT_NUMBER;
      case TableColumnTypes.SELECT:
        return FormFieldTypes.MULTISELECT;
      default:
        return FormFieldTypes.INPUT;
    }
  }

  private static getDefaultColumnOptions(type: TableColumnTypes): Partial<TableColumn> {
    switch (type) {
      case TableColumnTypes.BOOLEAN:
      case TableColumnTypes.NUMBER:
      case TableColumnTypes.DATE:
      case TableColumnTypes.DATETIME:
        return {
          styles: {
            alignment: 'center',
            cssClass: 'text-nowrap',
            isNarrow: true
          }
        };
      default:
        return {};
    }
  }

  static getDefaultRadioBooleanData(): FormFieldRadioData {
    return {
      options: [
        { label: strings.table.cells.boolean.value.true, value: true },
        { label: strings.table.cells.boolean.value.false, value: false },
        { label: strings.table.cells.boolean.value.together, value: '' }
      ]
    };
  }
}
