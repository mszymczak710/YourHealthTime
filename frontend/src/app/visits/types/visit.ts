import moment from 'moment';

import { BaseType } from '@core/types';

import { Disease } from '@dictionaries/diseases/types';
import { Office } from '@dictionaries/offices/types';

import { environmentBase } from '@environments/environment-base';

import { Doctor } from '@roles/doctors/types';
import { Patient } from '@roles/patients/types';

import { VisitStatus } from './visit-status';

export class Visit extends BaseType {
  created_at: Date;
  date: Date;
  disease?: Disease;
  doctor: Doctor;
  duration_in_minutes: number;
  hour: string;
  is_remote: boolean;
  notes: string;
  office: Office;
  patient: Patient;
  predicted_end_date: Date;
  visit_status: VisitStatus;

  constructor(data: Partial<Visit>) {
    super();
    Object.entries(data).forEach(([fieldName, val]) => {
      switch (fieldName) {
        case 'created_at':
        case 'predicted_end_data':
          if (data[fieldName]) {
            this[fieldName] = new Date(data[fieldName]);
          }
          break;
        case 'date':
          if (data[fieldName]) {
            this[fieldName] = new Date(data[fieldName]);
            this.hour = moment(this[fieldName]).format(environmentBase.backendTimeFormat);
          }
          break;
        case 'doctor':
          if (data[fieldName]) {
            this[fieldName] = new Doctor(data[fieldName]);
          }
          break;
        case 'patient':
          if (data[fieldName]) {
            this[fieldName] = new Patient(data[fieldName]);
          }
          break;
        default:
          this[fieldName] = val;
          break;
      }
    });
  }
}

export interface VisitSaveData {
  date: Date;
  disease?: string; // uuid
  doctor: string; // uuid
  duration_in_minutes: number;
  is_remote: boolean;
  notes: string;
  office: string; // uuid
  patient: string; // uuid
}
