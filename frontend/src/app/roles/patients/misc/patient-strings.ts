import { Gender } from '@roles/patients/types';

export const patientStrings = Object.freeze({
  patient: {
    address: {
      label: 'Adres'
    },
    birth_date: {
      label: 'Data urodzenia'
    },
    gender: {
      label: 'Płeć',
      options: {
        [Gender.FEMALE]: 'Kobieta',
        [Gender.MALE]: 'Mężczyzna'
      },
      placeholder: 'Wybierz płeć'
    },
    pesel: {
      label: 'PESEL',
      placeholder: 'Wpisz PESEL'
    },
    phone_number: {
      label: 'Numer telefonu',
      placeholder: 'Wpisz numer telefonu'
    },
    readable_id: {
      label: 'ID',
      placeholder: 'Wpisz ID'
    },
    user: {
      email: {
        label: 'E-mail',
        placeholder: 'Wpisz e-mail'
      },
      first_name: {
        label: 'Imię',
        placeholder: 'Wpisz imię'
      },
      last_name: {
        label: 'Nazwisko',
        placeholder: 'Wpisz nazwisko'
      }
    }
  }
});

export type PatientStrings = typeof patientStrings;
