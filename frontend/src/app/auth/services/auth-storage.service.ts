/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';

import { AuthToken, UserAuthData, UserRole } from '@auth/types';

@Injectable({
  providedIn: 'root'
})
export class AuthStorageService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user';

  storeAuthData(tokens: AuthToken, user: UserAuthData): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  clearAuthData(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getAccessToken(): string {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getUser(): UserAuthData {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  getUserRole(): UserRole {
    const user = this.getUser();
    return user ? user.role : null;
  }
}
