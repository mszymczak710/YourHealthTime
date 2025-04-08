import { nurseStrings } from '@roles/nurses/misc/nurse-strings';

export const strings = Object.freeze({
  listHeader: 'Pielęgniarki',
  nurse: nurseStrings.nurse
});

export type NursesListStrings = typeof strings;
