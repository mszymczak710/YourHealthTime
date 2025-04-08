import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Subscription, interval } from 'rxjs';
import { sprintf } from 'sprintf-js';

import { AuthFacade } from '@auth/services';

import { ClassExtender } from '@core/misc';
import { ToastService } from '@core/services';

import { environmentBase } from '@environments/environment-base';

import { StringsLoader } from '@layout/misc';
import { SessionTimerService } from '@layout/services';

export interface SessionTimerComponent extends StringsLoader {}

@Component({
  selector: 'yht-session-timer',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './session-timer.component.html',
  styleUrl: './session-timer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class SessionTimerComponent implements OnInit, OnDestroy {
  timeLeft: number = null;

  private intervalSubscription: Subscription;

  get formattedTime(): string {
    return this.timeLeft ? this.sessionTimerService.formatTime(this.timeLeft) : null;
  }

  constructor(
    private authFacade: AuthFacade,
    private cdr: ChangeDetectorRef,
    private sessionTimerService: SessionTimerService,
    private toastService: ToastService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.intervalSubscription = interval(1000).subscribe(() => this.updateTimeLeft());
    });
  }

  ngOnDestroy(): void {
    this.intervalSubscription?.unsubscribe();
  }

  private updateTimeLeft(): void {
    const remaining = this.sessionTimerService.getSecondsRemaining();
    const isActive = this.sessionTimerService.isSessionActive();
    if (remaining !== this.timeLeft) {
      this.timeLeft = remaining;

      this.zone.run(() => {
        if (remaining === environmentBase.tokenExpiryBufferSeconds) {
          this.toastService.showWarningMessage(sprintf(this.strings.sessionTimer.warn, environmentBase.tokenExpiryBufferSeconds));
        }

        if (!remaining && isActive) {
          this.toastService.showErrorMessage(this.strings.sessionTimer.sessionExpired);
          this.sessionTimerService.setSessionActive(false);
        }

        this.cdr.markForCheck();
      });
    }
  }

  refreshTokens(): void {
    this.authFacade.refreshTokens().subscribe(() => {
      this.toastService.showSuccessMessage(this.strings.sessionTimer.refreshToken.succeed);
    });
  }
}
