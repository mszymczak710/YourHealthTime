import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { AuthFacade } from '@auth/services';

import { ClassExtender } from '@core/misc';

import { MenuComponent, SessionTimerComponent } from '@layout/components';
import { StringsLoader } from '@layout/misc';

export interface LayoutComponent extends StringsLoader {}

@Component({
  selector: 'yht-layout',
  standalone: true,
  imports: [MenuComponent, RouterOutlet, SessionTimerComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class LayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  appInitialized = false;
  errorOccurred = false;

  constructor(
    private authFacade: AuthFacade,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authFacade.initialized$.pipe(takeUntil(this.destroy$)).subscribe(initialized => {
      this.appInitialized = initialized;
      this.cdr.markForCheck();
    });

    this.authFacade.errorOccurred$.pipe(takeUntil(this.destroy$)).subscribe(errorOccurred => {
      this.errorOccurred = errorOccurred;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
