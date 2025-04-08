import Decimal from 'decimal.js';

import { Medicine, MedicineForm } from '@dictionaries/medicines/types';

export interface Dosage {
  amount: Decimal;
  form: MedicineForm;
  frequency: string;
  medicine: Medicine;
}

export interface DosageSaveData {
  amount: Decimal;
  frequency: string;
  medicine: string; // uuid
}
