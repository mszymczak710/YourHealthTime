export const prescriptionStrings = Object.freeze({
  prescription: {
    description: {
      label: 'Opis',
      placeholder: 'Wpisz opis'
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
    dosages: {
      label: 'Dawkowanie'
    },
    expiry_date: {
      label: 'Data ważności'
    },
    issue_date: {
      label: 'Data wystawienia'
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
    prescription_code: {
      label: 'Kod recepty',
      placeholder: 'Wpisz kod recepty'
    },
    readable_id: {
      label: 'ID',
      placeholder: 'Wpisz ID'
    }
  }
});

export type PrerscriptionStrings = typeof prescriptionStrings;
