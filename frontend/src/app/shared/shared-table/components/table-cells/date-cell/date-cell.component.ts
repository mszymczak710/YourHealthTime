import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TableCellComponentBase } from '@shared/shared-table/misc';

@Component({
  selector: 'yht-date-cell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-cell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateCellComponent extends TableCellComponentBase {}
