import { VisitStatus } from '@visits/types';

export const visitStrings = Object.freeze({
  visit: {
    date: {
      label: 'Data wizyty'
    },
    doctor: {
      user: {
        first_name: {
          label: 'Imię lekarza',
          placeholder: 'Wpisz imię lekarza'
        },
        last_name: {
          label: 'Nazwisko lekarza',
          placeholder: 'Wpisz nazwisko lekarza'
        }
      }
    },
    duration_in_minutes: {
      label: 'Czas trwania'
    },
    is_remote: {
      label: 'Czy zdalna?'
    },
    notes: {
      label: 'Notatki',
      placeholder: 'Wpisz notatki'
    },
    office: {
      floor: {
        label: 'Piętro'
      },
      room_number: {
        label: 'Nr pokoju'
      }
    },
    patient: {
      user: {
        first_name: {
          label: 'Imię pacjenta',
          placeholder: 'Wpisz imię pacjenta'
        },
        last_name: {
          label: 'Nazwisko pacjenta',
          placeholder: 'Wpisz nazwisko pacjenta'
        }
      }
    },
    readable_id: {
      label: 'ID',
      placeholder: 'Wpisz ID'
    },
    visit_status: {
      label: 'Status',
      placeholder: 'Wybierz status',
      options: {
        [VisitStatus.COMPLETED]: 'Zakończona',
        [VisitStatus.IN_PROGRESS]: 'W toku',
        [VisitStatus.SCHEDULED]: 'Zaplanowana'
      }
    }
  }
});

export type VisitStrings = typeof visitStrings;
