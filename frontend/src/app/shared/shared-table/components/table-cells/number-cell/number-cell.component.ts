import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TableCellComponentBase } from '@shared/shared-table/misc';

@Component({
  selector: 'yht-number-cell',
  standalone: true,
  imports: [],
  templateUrl: './number-cell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumberCellComponent extends TableCellComponentBase {}
