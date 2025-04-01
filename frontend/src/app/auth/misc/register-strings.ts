export const registerStrings = Object.freeze({
  register: {
    button: 'Zarejestruj',
    fields: {
      address: {
        apartment_number: {
          label: 'Numer lokalu',
          placeholder: 'Wpisz numer lokalu'
        },
        city: {
          label: 'Miasto',
          placeholder: 'Wpisz miasto'
        },
        country: {
          label: 'Kraj',
          placeholder: 'Wpisz kraj'
        },
        house_number: {
          label: 'Numer domu',
          placeholder: 'Wpisz numer domu'
        },
        post_code: {
          label: 'Kod pocztowy',
          placeholder: 'Wpisz kod pocztowy'
        },
        street: {
          label: 'Ulica',
          placeholder: 'Wpisz ulicę'
        }
      },
      email: {
        label: 'Adres e-mail',
        placeholder: 'Wpisz adres e-mail'
      },
      first_name: {
        label: 'Imię',
        placeholder: 'Wpisz imię'
      },
      last_name: {
        label: 'Nazwisko',
        placeholder: 'Wpisz nazwisko'
      },
      password: {
        label: 'Hasło',
        placeholder: 'Wpisz hasło'
      },
      password_confirm: {
        label: 'Powtórz hasło',
        placeholder: 'Wpisz ponownie hasło'
      },
      pesel: {
        label: 'PESEL',
        placeholder: 'Wpisz PESEL'
      },
      phone_number: {
        label: 'Numer telefonu',
        placeholder: 'Wpisz numer telefonu'
      }
    },
    step: {
      label: {
        address: 'Adres',
        basicData: 'Dane podstawowe',
        recaptcha: 'ReCAPTCHA'
      },
      next: 'Dalej',
      previous: 'Wróć'
    },
    succeed: 'Link weryfikacyjny został wysłany na podany adres e-mail',
    title: 'Rejestracja'
  }
});

export type RegisterStrings = typeof registerStrings;
