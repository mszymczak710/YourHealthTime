import { diseaseStrings } from './disease-strings';

export const strings = Object.freeze({
  disease: diseaseStrings.disease,
  listHeader: 'Choroby'
});

export type DiseaseListStrings = typeof strings;
