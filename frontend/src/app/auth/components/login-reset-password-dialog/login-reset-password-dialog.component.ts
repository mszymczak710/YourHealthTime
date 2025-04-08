import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { LoginFormComponent } from '@auth/components/login-form/login-form.component';
import { ResetPasswordFormComponent } from '@auth/components/reset-password-form/reset-password-form.component';
import { StringsLoader } from '@auth/misc';
import { AuthFacade } from '@auth/services';

import { SpinnerComponent } from '@core/components';
import { ClassExtender, handleRequestErrors } from '@core/misc';
import { ToastService } from '@core/services';

import { DialogFormCanDeactivate } from '@shared/shared-form/misc';

export interface LoginResetPasswordDialogComponent
  extends DialogFormCanDeactivate<LoginResetPasswordDialogComponent, void>,
    StringsLoader {}

@Component({
  selector: 'yht-login-reset-password-dialog',
  standalone: true,
  imports: [LoginFormComponent, MatButtonModule, ResetPasswordFormComponent, MatDialogModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './login-reset-password-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([DialogFormCanDeactivate, StringsLoader])
export class LoginResetPasswordDialogComponent
  extends DialogFormCanDeactivate<LoginResetPasswordDialogComponent, void>
  implements OnInit, AfterViewInit
{
  @ViewChild(LoginFormComponent)
  set loginFormComponent(component: LoginFormComponent) {
    if (component && !this.isForgotPasswordMode) {
      this.form = component.form;
    }
  }

  @ViewChild(ResetPasswordFormComponent)
  set resetPasswordFormComponent(component: ResetPasswordFormComponent) {
    if (component && this.isForgotPasswordMode) {
      this.form = component.form;
    }
  }

  private email: string;

  form = new UntypedFormGroup({});

  isForgotPasswordMode = false;
  saving = false;

  get title(): string {
    return this.isForgotPasswordMode ? this.strings.resetPassword.title : this.strings.login.title;
  }

  constructor(
    protected override dialogRef: MatDialogRef<LoginResetPasswordDialogComponent, void>,
    private authFacade: AuthFacade,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {
    super();
  }

  ngOnInit(): void {
    this.dialogRef.addPanelClass('dialog-sm');
    this.handleClose();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  goToResetPasswordForm(): void {
    this.isForgotPasswordMode = true;
    this.cdr.detectChanges();
    this.fillEmailField();
  }

  private fillEmailField(): void {
    const control = this.form.get('email');
    if (!control.value) {
      control.setValue(this.email);
    }
  }

  setEmail(email: string): void {
    this.email = email;
  }

  submit(event: Event): void {
    event.preventDefault();
    this.saving = true;

    const operation = this.isForgotPasswordMode ? this.authFacade.resetPassword(this.form.value) : this.authFacade.login(this.form.value);

    operation.subscribe({
      next: () => {
        this.dialogRef.close();
        this.toastService.showSuccessMessage(this.isForgotPasswordMode ? this.strings.resetPassword.succeed : this.strings.login.succeed);
      },
      error: error => {
        this.saving = false;
        handleRequestErrors.call(this, error, this.form);
        this.cdr.markForCheck();
      }
    });
  }

  override canDeactivate(): boolean | Observable<boolean> {
    return this.form.dirty;
  }
}
