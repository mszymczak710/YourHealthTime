import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@layout/misc';

export interface PageNotFoundComponent extends StringsLoader {}

@Component({
  selector: 'yht-page-not-found',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, RouterModule],
  templateUrl: './page-not-found.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class PageNotFoundComponent {}
