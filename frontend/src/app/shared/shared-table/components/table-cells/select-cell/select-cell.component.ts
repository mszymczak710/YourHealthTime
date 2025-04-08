import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { environmentBase } from '@environments/environment-base';

import { TableCellComponentBase } from '@shared/shared-table/misc';
import { TableSelectCellData } from '@shared/shared-table/types';

@Component({
  selector: 'yht-select-cell',
  standalone: true,
  imports: [],
  templateUrl: './select-cell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectCellComponent extends TableCellComponentBase implements OnInit {
  humanValue: string;

  private get columnData(): TableSelectCellData<any> {
    return this.column.data as TableSelectCellData<any>;
  }

  ngOnInit(): void {
    this.humanValue = this.getValue();
  }

  getValue(): string {
    const options = this.columnData?.options;
    const columnValue = super.getValue();

    if (!options) {
      return columnValue;
    }

    const optionLabelKey = this.columnData.optionLabelKey || environmentBase.select.optionLabelKey;
    const optionValueKey = this.columnData.optionValueKey || environmentBase.select.optionValueKey;
    const selectedOption = options.find(option => option[optionValueKey] === columnValue);

    if (selectedOption) {
      return selectedOption[optionLabelKey];
    }
  }
}
