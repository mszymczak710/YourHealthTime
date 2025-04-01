export const doctorStrings = Object.freeze({
  doctor: {
    job_execution_number: {
      label: 'Numer wykonywania zawodu',
      placeholder: 'Wpisz numer wykonywania zawodu'
    },
    readable_id: {
      label: 'ID',
      placeholder: 'Wpisz ID'
    },
    specializations: {
      label: 'Specjalizacje'
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

export type DoctorStrings = typeof doctorStrings;
