import { Gender } from '@roles/patients/types';

import { patientStrings } from './patient-strings';

export const strings = Object.freeze({
  actions: {
    edit: {
      label: 'Edytuj pacjenta',
      succeed: 'Zapisano dane pacjenta',
      title: 'Edycja pacjenta'
    }
  },
  form: {
    fields: {
      address: {
        apartment_number: {
          label: 'Numer lokalu',
          placeholder: 'Wpisz numer lokalu'
        },
        city: {
          label: 'Miasto',
          placeholder: 'Wpisz miasto'
        },
        country: {
          label: 'Kraj',
          placeholder: 'Wpisz kraj'
        },
        house_number: {
          label: 'Numer domu',
          placeholder: 'Wpisz numer domu'
        },
        post_code: {
          label: 'Kod pocztowy',
          placeholder: 'Wpisz kod pocztowy'
        },
        street: {
          label: 'Ulica',
          placeholder: 'Wpisz ulicę'
        }
      },
      birth_date: {
        label: 'Data urodzenia'
      },
      gender: {
        label: 'Płeć',
        options: {
          [Gender.FEMALE]: 'Kobieta',
          [Gender.MALE]: 'Mężczyzna'
        }
      },
      pesel: {
        label: 'PESEL'
      },
      phone_number: {
        label: 'Numer telefonu',
        placeholder: 'Wpisz numer telefonu'
      },
      user: {
        email: {
          label: 'Adres e-mail'
        },
        first_name: {
          label: 'Imię'
        },
        last_name: {
          label: 'Nazwisko'
        }
      }
    },
    title: {
      address: 'Adres',
      data: 'Dane pacjenta'
    }
  },
  listHeader: 'Pacjenci',
  patient: patientStrings.patient
});

export type PatientsListStrings = typeof strings;
