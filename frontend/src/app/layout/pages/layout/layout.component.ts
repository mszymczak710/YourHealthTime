import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MenuComponent, SessionTimerComponent } from '@layout/components';

@Component({
  selector: 'wvw-layout',
  standalone: true,
  imports: [MenuComponent, RouterOutlet, SessionTimerComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent {}
