import { changePasswordStrings } from '@auth/misc/change-password-strings';
import { emailVerificationStrings } from '@auth/misc/email-verification-strings';
import { loginStrings } from '@auth/misc/login-strings';
import { logoutStrings } from '@auth/misc/logout-strings';
import { registerStrings } from '@auth/misc/register-strings';
import { resetPasswordStrings } from '@auth/misc/reset-password-strings';
import { userStrings } from '@auth/misc/user-strings';

export const strings = Object.freeze({
  changePassword: changePasswordStrings.changePassword,
  emailVerification: emailVerificationStrings.emailVerification,
  login: loginStrings.login,
  logout: logoutStrings.logout,
  register: registerStrings.register,
  resetPassword: resetPasswordStrings.resetPassword,
  user: userStrings.user
});

export type AuthStrings = typeof strings;
