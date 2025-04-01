import { Country } from '@dictionaries/countries/types';

export interface Address {
  apartment_number: string;
  city: string;
  country: Country;
  house_number: string;
  post_code: string;
  street: string;
}

export type AddressRequestData = Omit<Address, 'country'> & { country: string };
