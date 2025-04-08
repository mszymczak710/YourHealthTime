import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { UserAuthData } from '@auth/types';

import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@layout/misc';

export interface AdminDashboardComponent extends StringsLoader {}

@Component({
  selector: 'yht-admin-dashboard',
  standalone: true,
  imports: [MatButtonModule, MatCardModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class AdminDashboardComponent {
  @Input() user: UserAuthData;
}
