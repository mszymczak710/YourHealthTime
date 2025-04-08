import { HttpErrorStatus } from '@core/types';

export const commonStrings = Object.freeze({
  cancel: 'Anuluj',
  edit: 'Edytuj',
  errors: {
    form: {
      apartmentNumber: 'Numer mieszkania musi być liczbą z zakresu od 1 do 999.',
      city: 'Nazwa miasta musi zaczynać się wielką literą i zawierać wyłącznie litery, spacje i myślniki.',
      email: 'Wprowadź poprawny adres e-mail',
      firstName: 'Imię musi zaczynać się wielką literą, a następnie zawierać małe litery.',
      lastName: 'Nazwisko musi zaczynać się wielką literą, a następnie zawierać małe litery.',
      houseNumber:
        '"Numer domu musi zaczynać się od cyfry innej niż zero, opcjonalnie może zawierać do dwóch dodatkowych cyfr i kończyć się pojedynczą literą.',
      matDatepickerParse: 'Niepoprawny format daty.',
      matTimepickerParse: 'Niepoprawny format godziny.',
      max: 'Wartość nie może być większa niż %s.',
      min: 'Wartość nie może być mniejsza niż %s.',
      pesel: {
        checkSum: 'Nieprawidłowy numer PESEL.',
        length: 'Numer PESEL musi składać się z 11 cyfr.'
      },
      phoneNumber: 'Nieprawidłowy format numeru telefonu. Wprowadź poprawny numer telefonu.',
      postCode: 'Nieprawidłowy format kodu pocztowego. Wprowadź poprawny kod w formacie XX-XXX.',
      required: 'To pole jest wymagane.',
      street: 'Nazwa miasta musi zaczynać się wielką literą i zawierać wyłącznie litery, spacje i myślniki.'
    },
    http: {
      [HttpErrorStatus.BAD_REQUEST]: 'Wystąpił błąd',
      [HttpErrorStatus.FORBIDDEN]: 'Nie masz uprawnień, by wykonać tę czynność.',
      [HttpErrorStatus.INTERNAL_SERVER_ERROR]: 'Wystąpił wewnętrzny błąd serwera. Spróbuj ponownie później.',
      [HttpErrorStatus.NOT_FOUND]: 'Nie znaleziono zasobu.',
      [HttpErrorStatus.TOO_MANY_REQUESTS]: 'Za dużo żądań. Spróbuj ponownie później.',
      [HttpErrorStatus.UNAUTHORIZED]: 'Nie podano danych uwierzytelniających.'
    }
  },
  exitUnsaved: 'Wprowadzone zmiany zostaną utracone. Czy chcesz opuścić formularz?',
  no: 'Nie',
  noDataRow: 'Brak danych do wyświetlenia',
  notEnoughChars: 'Wprowadź minimum %d znaki',
  optionNotFound: 'Nie znaleziono opcji',
  permissionDenied: 'Brak uprawnień',
  save: 'Zapisz',
  yes: 'Tak'
});

export type CommonStrings = typeof commonStrings;
