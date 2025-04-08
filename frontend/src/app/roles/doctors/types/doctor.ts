import { User } from '@auth/types';

import { BaseType } from '@core/types';

import { Specialization } from '@dictionaries/specializations/types';

export class Doctor extends BaseType {
  job_execution_number: string;
  specializations: Specialization[];
  user: User;

  constructor(data: Partial<Doctor>) {
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

export interface DoctorPatchData {
  specializations: string[]; // uuid'y
}
