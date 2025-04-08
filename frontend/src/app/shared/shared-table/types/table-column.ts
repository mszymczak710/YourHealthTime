import { TableColumnStyle } from './table-column-style';
import { TableColumnTypes } from './table-column-types';
import { TableFilter } from './table-filter';
import { TableSelectCellData } from './table-select-cell-data';

export interface TableColumn<T = any> {
  data?: TableSelectCellData<T> | any;
  filter: TableFilter;
  label: string;
  name: string;
  sortable?: boolean;
  styles?: TableColumnStyle;
  type: TableColumnTypes;
}
