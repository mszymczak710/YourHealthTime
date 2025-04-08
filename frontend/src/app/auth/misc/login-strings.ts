export const loginStrings = Object.freeze({
  login: {
    button: 'Zaloguj',
    fields: {
      email: {
        label: 'Adres e-mail',
        placeholder: 'Wpisz adres e-mail'
      },
      password: {
        label: 'Hasło',
        placeholder: 'Wpisz hasło'
      }
    },
    forgotPassword: {
      button: 'Nie pamiętasz hasła?'
    },
    succeed: 'Zalogowano pomyślnie',
    title: 'Logowanie'
  }
});

export type LoginStrings = typeof loginStrings;
