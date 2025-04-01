import { BaseType } from '@core/types';

import { Dosage, DosageSaveData } from '@prescriptions/types/dosage';

import { Doctor } from '@roles/doctors/types';
import { Patient } from '@roles/patients/types';

export class Prescription extends BaseType {
  expiry_date: Date;
  description: string;
  issue_date: Date;
  doctor: Doctor;
  dosages: Dosage[];
  patient: Patient;
  prescription_code: string;
  visit: string; // uuid

  constructor(data: Partial<Prescription>) {
    super();
    Object.entries(data).forEach(([fieldName, val]) => {
      switch (fieldName) {
        case 'expiry_date':
        case 'issue_date':
          if (data[fieldName]) {
            this[fieldName] = new Date(data[fieldName]);
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

export interface PrescriptionSaveData {
  description: string;
  doctor: string; // uuid
  dosages: DosageSaveData[];
  patient: string; // uuid
}
