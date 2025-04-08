import { userStrings } from '@auth/misc';

import { UserRole } from './user-role';

export class User {
  email: string;
  first_name: string;
  last_name: string;

  constructor(data: Partial<User>) {
    Object.entries(data).forEach(([fieldName, val]) => {
      switch (fieldName) {
        default:
          this[fieldName] = val;
          break;
      }
    });
  }
}

export class UserAuthData extends User {
  profile_id: string;
  role: UserRole;

  constructor(data: Partial<UserAuthData>) {
    super(data);
  }

  private readonly roleLabels: Record<UserRole, string> = {
    [UserRole.ADMIN]: userStrings.user.role[UserRole.ADMIN],
    [UserRole.DOCTOR]: userStrings.user.role[UserRole.DOCTOR],
    [UserRole.NURSE]: userStrings.user.role[UserRole.NURSE],
    [UserRole.PATIENT]: userStrings.user.role[UserRole.PATIENT]
  };

  getRole(): string {
    return this.roleLabels[this.role];
  }
}
