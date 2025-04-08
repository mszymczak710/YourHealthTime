import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ClassExtender } from '@core/misc';

import { StringsLoader, TableCellComponentBase } from '@shared/shared-table/misc';

export interface BooleanCellComponent extends StringsLoader {}

@Component({
  selector: 'yht-boolean-cell',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule],
  templateUrl: './boolean-cell.component.html',
  styleUrl: './boolean-cell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class BooleanCellComponent extends TableCellComponentBase {}
