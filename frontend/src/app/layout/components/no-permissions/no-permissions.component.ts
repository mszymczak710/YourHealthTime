import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@layout/misc';

export interface NoPermissionsComponent extends StringsLoader {}

@Component({
  selector: 'yht-no-permissions',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, RouterModule],
  templateUrl: './no-permissions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class NoPermissionsComponent {}
