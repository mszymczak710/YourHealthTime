import { BaseType } from '@core/types';

import { ActiveIgredient } from './active-ingredient';
import { MedicineForm } from './medicine-form';
import { TypeOfMedicine } from './type-of-medicine';

export interface Medicine extends BaseType {
  active_igredients: ActiveIgredient[];
  form: MedicineForm;
  name: string;
  type_of_medicine: TypeOfMedicine;
}
