import { AuthToken } from '@auth/types/auth-token';

import { UserAuthData } from './user';

export interface LoginRequestData {
  email: string;
  password: string;
}

export interface LoginResponseData {
  tokens: AuthToken;
  user: UserAuthData;
}
