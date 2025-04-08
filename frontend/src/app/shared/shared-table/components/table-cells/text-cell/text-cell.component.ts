import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TableCellComponentBase } from '@shared/shared-table/misc';

@Component({
  selector: 'yht-text-cell',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './text-cell.component.html',
  styleUrl: './text-cell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextCellComponent extends TableCellComponentBase {
  isExpanded = false;

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }
}
