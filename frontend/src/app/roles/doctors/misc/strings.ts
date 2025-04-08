import { doctorStrings } from '@roles/doctors/misc/doctor-strings';

export const strings = Object.freeze({
  actions: {
    edit: {
      label: 'Edytuj lekarza',
      succeed: 'Zapisano dane lekarza',
      title: 'Edycja lekarza'
    }
  },
  doctor: doctorStrings.doctor,
  form: {
    fields: {
      job_execution_number: {
        label: 'Numer wykonywania zawodu'
      },
      specializations: {
        addButtonLabel: 'Dodaj specjalizacje',
        label: 'Specjalizacje',
        specialization: {
          label: 'Specjalizacja',
          placeholder: 'Wybierz specjalizację'
        }
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
    title: 'Dane lekarza'
  },
  listHeader: 'Lekarze'
});

export type DoctorsListStrings = typeof strings;
