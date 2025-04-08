import { ChangeDetectionStrategy, Component } from '@angular/core';

import { LayoutComponent } from './layout/pages';

@Component({
  selector: 'yht-root',
  standalone: true,
  imports: [LayoutComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}
