import { prescriptionStrings } from '@prescriptions/misc/prescription-strings';

export const strings = Object.freeze({
  actions: {
    create: {
      label: 'Dodaj receptę',
      succeed: 'Dodano receptę',
      title: 'Dodawanie recepty'
    },
    delete: {
      confirm: {
        content: 'Czy na pewno chcesz usunąć receptę od ID: %s?',
        succeed: 'Recepta o ID %s została usunięta',
        title: 'Potwierdzenie usunięcia recepty'
      },
      label: 'Usuń receptę'
    }
  },
  dosageDetail: '%s, %dx %s, %s',
  form: {
    fields: {
      description: {
        label: 'Opis',
        placeholder: 'Wpisz opis'
      },
      doctor: {
        description: '%s %s (nr prawa wykonywania zawodu: %s)',
        label: 'Lekarz',
        placeholder: 'Wybierz lekarza'
      },
      dosages: {
        addButtonLabel: 'Dodaj pozycję',
        amount: {
          label: 'Ilość',
          placeholder: 'Wpisz ilość'
        },
        frequency: {
          label: 'Częstotliwość',
          placeholder: 'Wpisz częstotliwość'
        },
        label: 'Dawkowanie',
        medicine: {
          label: 'Lek',
          placeholder: 'Wybierz lek'
        }
      },
      patient: {
        description: '%s %s (PESEL: %s)',
        label: 'Pacjent',
        placeholder: 'Wybierz pacjenta'
      }
    },
    step: {
      label: {
        basicData: 'Podstawowe dane',
        dosages: 'Dawkowanie'
      },
      next: 'Dalej',
      previous: 'Wstecz'
    }
  },
  listHeader: 'Recepty',
  prescription: prescriptionStrings.prescription
});

export type PrerscriptionsListStrings = typeof strings;
