export const resetPasswordStrings = Object.freeze({
  resetPassword: {
    button: 'Resetuj hasło',
    confirm: {
      succeed: 'Hasło zostało pomyślnie ustawione',
      title: 'Ustawianie nowego hasła'
    },
    fields: {
      email: {
        label: 'Adres e-mail',
        placeholder: 'Wpisz adres e-mail'
      }
    },
    succeed: 'Link z hasłem resetującym hasło został wysłany na podany adres e-mail',
    title: 'Resetowanie hasła'
  }
});

export type ResetPasswordStrings = typeof resetPasswordStrings;
