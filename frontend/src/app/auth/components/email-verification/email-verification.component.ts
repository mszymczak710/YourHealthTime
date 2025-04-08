import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { StringsLoader } from '@auth/misc';
import { AuthFacade } from '@auth/services';

import { ClassExtender } from '@core/misc';

export interface EmailVerificationComponent extends StringsLoader {}

@Component({
  selector: 'yht-email-verification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-verification.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class EmailVerificationComponent implements OnInit {
  errorMessage: string;
  message = '';

  constructor(
    private authFacade: AuthFacade,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const uidb64 = this.route.snapshot.paramMap.get('uidb64');
    const token = this.route.snapshot.paramMap.get('token');

    if (uidb64 && token) {
      this.verifyEmail(uidb64, token);
    }
  }

  verifyEmail(uidb64: string, token: string): void {
    this.authFacade.verifyEmail({ uidb64, token }).subscribe({
      next: () => {
        this.message = this.strings.emailVerification.succeed;
        this.cdr.markForCheck();
      },
      error: error => {
        if (error.error.non_field_errors) {
          this.errorMessage = Array.isArray(error.error.non_field_errors)
            ? error.error.non_field_errors.join('. ')
            : error.error.non_field_errors;
          this.cdr.markForCheck();
        }
      }
    });
  }
}
