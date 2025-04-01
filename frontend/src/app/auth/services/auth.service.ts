import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { sprintf } from 'sprintf-js';
import { environmentBase } from 'src/environments/environment-base';

import {
  AuthToken,
  ChangePasswordData,
  EmailVerificationData,
  LoginRequestData,
  LoginResponseData,
  RegisterRequestData,
  ResetPasswordConfirmData,
  ResetPasswordRequestData,
  ResetPasswordVerificationData,
  TokenLifetime,
  UserAuthData
} from '@auth/types';

import { Endpoints } from '@core/misc';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  private buildUrl(...parts: string[]): string {
    return parts.map(part => part.replace(/(^\/|\/$)/g, '')).join('/') + '/';
  }

  changePassword(data: ChangePasswordData): Observable<unknown> {
    const url = this.buildUrl(environmentBase.apiUrl, Endpoints.urls.auth.changePassword);
    return this.http.post(url, data);
  }

  confirmResetPassword(params: ResetPasswordVerificationData, data: ResetPasswordConfirmData): Observable<unknown> {
    const { uidb64, token } = params;
    const url = this.buildUrl(environmentBase.apiUrl, sprintf(Endpoints.urls.auth.resetPasswordConfirm, uidb64, token));
    return this.http.post(url, data);
  }

  forceLogout(email: string): Observable<unknown> {
    const url = this.buildUrl(environmentBase.apiUrl, Endpoints.urls.auth.forceLogout);
    return this.http.post<LoginResponseData>(url, { email });
  }

  login(data: LoginRequestData): Observable<LoginResponseData> {
    const url = this.buildUrl(environmentBase.apiUrl, Endpoints.urls.auth.login);
    return this.http.post<LoginResponseData>(url, data);
  }

  logout(refresh: string): Observable<unknown> {
    const url = this.buildUrl(environmentBase.apiUrl, Endpoints.urls.auth.logout);
    return this.http.post<{ refresh }>(url, { refresh });
  }

  register(data: RegisterRequestData): Observable<unknown> {
    const url = this.buildUrl(environmentBase.apiUrl, Endpoints.urls.auth.register);
    return this.http.post<RegisterRequestData>(url, data);
  }

  resetPassword(data: ResetPasswordRequestData): Observable<unknown> {
    const url = this.buildUrl(environmentBase.apiUrl, Endpoints.urls.auth.resetPassword);
    return this.http.post<ResetPasswordRequestData>(url, data);
  }

  verifyEmail(params: EmailVerificationData): Observable<unknown> {
    const { uidb64, token } = params;
    const url = this.buildUrl(environmentBase.apiUrl, sprintf(Endpoints.urls.auth.verifyEmail, uidb64, token));
    return this.http.get(url);
  }

  getDefaultTokenLifetime(): Observable<TokenLifetime> {
    const url = this.buildUrl(environmentBase.apiUrl, Endpoints.urls.auth.token.lifeTime);
    return this.http.get<TokenLifetime>(url);
  }

  refreshTokens(refresh: string): Observable<AuthToken> {
    const url = this.buildUrl(environmentBase.apiUrl, Endpoints.urls.auth.token.refresh);
    return this.http.post<AuthToken>(url, { refresh });
  }

  getUserInfo(): Observable<UserAuthData> {
    const url = this.buildUrl(environmentBase.apiUrl, Endpoints.urls.auth.userInfo);
    return this.http.get<UserAuthData>(url);
  }
}
