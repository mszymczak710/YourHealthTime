import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TableCellComponentBase } from '@shared/shared-table/misc';

@Component({
  selector: 'yht-datetime-cell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './datetime-cell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatetimeCellComponent extends TableCellComponentBase {}
