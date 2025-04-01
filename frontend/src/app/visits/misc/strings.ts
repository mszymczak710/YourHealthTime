import { visitStrings } from './visit-strings';

export const strings = Object.freeze({
  actions: {
    create: {
      label: 'Dodaj wizytę',
      succeed: 'Dodano wizytę',
      title: 'Dodawanie wizyty'
    },
    delete: {
      confirm: {
        content: 'Czy na pewno chcesz usunąć wizytę od ID: %s?',
        succeed: 'Wizyta o ID %s została usunięta',
        title: 'Potwierdzenie usunięcia wizyty'
      },
      label: 'Usuń wizytę'
    },
    edit: {
      label: 'Edytuj wizytę',
      succeed: 'Zapisano wizytę',
      title: 'Edycja wizyty'
    }
  },
  form: {
    fields: {
      date: {
        label: 'Data wizyty'
      },
      disease: {
        label: 'Choroba',
        placeholder: 'Wybierz chorobę'
      },
      doctor: {
        description: '%s %s (nr wykonywania zawodu: %s)',
        label: 'Lekarz',
        placeholder: 'Wybierz lekarza'
      },
      duration_in_minutes: {
        label: 'Czas trwania wizyty [min]'
      },
      hour: {
        label: 'Godzina wizyty'
      },
      is_remote: {
        label: 'Czy zdalna?',
        options: {
          false: 'Nie',
          true: 'Tak'
        }
      },
      notes: {
        label: 'Notatki',
        placeholder: 'Wpisz notatki'
      },
      office: {
        description: '%s (piętro: %d, pokój: %d)',
        label: 'Gabinet',
        placeholder: 'Wybierz gabinet'
      },
      patient: {
        description: '%s %s (PESEL: %s)',
        label: 'Pacjent',
        placeholder: 'Wybierz pacjenta'
      }
    }
  },
  listHeader: 'Wizyty',
  visit: visitStrings.visit
});

export type VisitsListStrings = typeof strings;
