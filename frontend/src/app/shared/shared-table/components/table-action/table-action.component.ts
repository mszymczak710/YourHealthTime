import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PermissionDirective } from '@core/directives';

import { TableAction } from '@shared/shared-table/types/table-action';

@Component({
  selector: 'yht-table-action',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, PermissionDirective],
  templateUrl: './table-action.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableActionComponent {
  @Input() action: TableAction;
  @Input() row: any;

  actionDisabled(row: any): boolean {
    return this.action.disabled ? this.action.disabled(row) : false;
  }

  disabledLabel(row: any): string {
    return this.action.disabledLabel ? this.action.disabledLabel(row) : null;
  }
}
