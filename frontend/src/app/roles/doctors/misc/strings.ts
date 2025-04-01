import { doctorStrings } from '@roles/doctors/misc/doctor-strings';

export const strings = Object.freeze({
  actions: {
    delete: {
      confirm: {
        content: 'Czy na pewno chcesz usunąć lekarza od ID: %s?',
        succeed: 'Lekarz o ID %s został usunięty',
        title: 'Potwierdzenie usunięcia lekarza'
      },
      label: 'Usuń lekarza'
    },
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
