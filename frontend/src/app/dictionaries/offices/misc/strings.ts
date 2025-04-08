import { officeStrings } from './office-strings';

export const strings = Object.freeze({
  listHeader: 'Gabinety',
  office: officeStrings.office
});

export type OfficeListStrings = typeof strings;
