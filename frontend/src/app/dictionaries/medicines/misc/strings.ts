import { medicineStrings } from './medicine-strings';

export const strings = Object.freeze({
  activeIngredientDetails: '%s (%d %s)',
  listHeader: 'Leki',
  medicine: medicineStrings.medicine
});

export type MedicineListStrings = typeof strings;
