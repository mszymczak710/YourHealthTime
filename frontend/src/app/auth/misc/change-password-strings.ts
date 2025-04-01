export const changePasswordStrings = Object.freeze({
  changePassword: {
    button: 'Zmień hasło',
    fields: {
      old_password: {
        label: 'Stare hasło',
        placeholder: 'Wpisz stare hasło'
      },
      password: {
        label: 'Nowe hasło',
        placeholder: 'Wpisz nowe hasło'
      },
      password_confirm: {
        label: 'Powtórz nowe hasło',
        placeholder: 'Wpisz ponownie nowe hasło'
      }
    },
    succeed: 'Hasło zostało zmienione',
    title: 'Zmiana hasła'
  }
});

export type ChangePasswordStrings = typeof changePasswordStrings;
