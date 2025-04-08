import { AddressRequestData } from './address';

export interface RegisterRequestData {
  address: AddressRequestData;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  pesel: string;
  phone_number: string;
  recaptcha_response: string;
}
