import { UserRole } from '@auth/types';

export const userStrings = Object.freeze({
  user: {
    role: {
      [UserRole.ADMIN]: 'Administrator',
      [UserRole.DOCTOR]: 'Lekarz',
      [UserRole.NURSE]: 'Pielęgniarka',
      [UserRole.PATIENT]: 'Pacjent'
    }
  }
});

export type UserStrings = typeof userStrings;
