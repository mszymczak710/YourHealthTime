export const menuStrings = {
  menu: {
    actions: {
      changePassword: 'Zmień hasło',
      login: 'Zaloguj się',
      logout: 'Wyloguj się',
      register: 'Zarejestruj się'
    },
    dictionaries: {
      group: {
        countries: 'Kraje',
        diseases: 'Choroby',
        medicines: 'Leki',
        offices: 'Gabinety',
        specializations: 'Specjalizacje'
      },
      label: 'Słowniki'
    },
    logoName: 'Your Health Time',
    prescriptions: 'Recepty',
    roles: {
      group: {
        doctors: 'Lekarze',
        nurses: 'Pielęgniarki',
        patients: 'Pacjenci'
      },
      label: 'Użytkownicy'
    },
    visits: 'Wizyty',
    user: {
      role: {
        title: 'Rola:'
      }
    }
  }
};

export type MenuStrings = typeof menuStrings;
