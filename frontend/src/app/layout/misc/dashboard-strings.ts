export const dashboardStrings = {
  dashboard: {
    admin: {
      button: 'Przejdź do Django Admin',
      description: 'Aby w pełni zarządzać systemem, przejdź do panelu Django Admin.',
      title: 'Witaj w panelu administracyjnym'
    },
    doctor: {
      edit: {
        succeed: 'Zapisano dane lekarza'
      },
      form: {
        fields: {
          specializations: {
            addButtonLabel: 'Dodaj specjalizację',
            specialization: {
              label: 'Specjalizacja',
              placeholder: 'Wybierz specjalizację'
            }
          }
        }
      },
      title: {
        specializations: 'Specjalizacje',
        data: 'Dane lekarza'
      }
    },
    nurse: {
      form: {
        fields: {
          nursing_license_number: {
            label: 'Numer licencji pielęgniarskiej'
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
        }
      },
      title: 'Dane pielęgniarki'
    },
    patient: {
      edit: {
        succeed: 'Zapisano dane pacjenta'
      },
      title: {
        address: 'Adres',
        data: 'Dane pacjenta'
      }
    },
    unauthorized: {
      actions: {
        login: 'Zaloguj się',
        register: 'Zarejestruj się'
      },
      features: {
        account: {
          title: 'Zarządzaj kontem',
          description: 'Edytuj dane osobowe po zalogowaniu.'
        },
        prescriptions: {
          title: 'Twoje recepty',
          description: 'Zawsze dostęp do aktywnych e-recept.'
        },
        visits: {
          title: 'Przeglądaj wizyty',
          description: 'Sprawdź zaplanowane i przeszłe wizyty.'
        }
      },
      paragraph: [
        'Jeśli nie masz jeszcze konta, naciśnij przycisk <strong>Zarejestruj się</strong>.',
        'Jeśli już posiadasz konto – <strong>Zaloguj się</strong>, aby kontynuować.'
      ],
      title: 'Witaj w aplikacji'
    }
  }
};

export type DashboardStrings = typeof dashboardStrings;
