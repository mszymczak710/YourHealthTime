import { countryStrings } from './country-strings';

export const strings = Object.freeze({
  country: countryStrings.country,
  listHeader: 'Kraje'
});

export type CountryListStrings = typeof strings;
