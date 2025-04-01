import { Address, User } from '@auth/types';

import { BaseType } from '@core/types';

import { Gender } from '@roles/patients/types/gender';

export class Patient extends BaseType {
  address: Address;
  birth_date: Date;
  gender: Gender;
  pesel: string;
  phone_number: string;
  user: User;

  constructor(data: Partial<Patient>) {
    super();
    Object.entries(data).forEach(([fieldName, val]) => {
      switch (fieldName) {
        case 'birth_date':
          if (data[fieldName]) {
            this[fieldName] = new Date(data[fieldName]);
          }
          break;
        case 'user':
          if (data[fieldName]) {
            this[fieldName] = new User(data[fieldName]);
          }
          break;
        default:
          this[fieldName] = val;
          break;
      }
    });
  }
}
