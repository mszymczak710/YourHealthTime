export const nurseStrings = Object.freeze({
  nurse: {
    nursing_license_number: {
      label: 'Numer licencji pielęgniarskiej',
      placeholder: 'Wpisz numer licencji pielęgniarskiej'
    },
    readable_id: {
      label: 'ID',
      placeholder: 'Wpisz ID'
    },
    user: {
      email: {
        label: 'E-mail',
        placeholder: 'Wpisz e-mail'
      },
      first_name: {
        label: 'Imię',
        placeholder: 'Wpisz imię'
      },
      last_name: {
        label: 'Nazwisko',
        placeholder: 'Wpisz nazwisko'
      }
    }
  }
});

export type NurseStrings = typeof nurseStrings;
