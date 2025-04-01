import { User } from '@auth/types';

import { BaseType } from '@core/types';

export class Nurse extends BaseType {
  nursing_license_number: string;
  user: User;

  constructor(data: Partial<Nurse>) {
    super();
    Object.entries(data).forEach(([fieldName, val]) => {
      switch (fieldName) {
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
