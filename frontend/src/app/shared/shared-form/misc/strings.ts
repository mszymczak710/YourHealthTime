export const strings = Object.freeze({
  date: {
    placeholder: 'DD.MM.RRRR'
  },
  dateRange: {
    endDate: {
      placeholder: 'Data do',
      tooltip: 'Wprowadź datę końcową w formacie DD.MM.RRRR'
    },
    hint: 'DD.MM.RRRR - DD.MM.RRRR',
    startDate: {
      placeholder: 'Data od',
      tooltip: 'Wprowadź datę początkową w formacie DD.MM.RRRR'
    }
  },
  formList: {
    delete: 'Usuń rekord'
  },
  input: {
    placeholder: 'Wpisz wartość'
  },
  inputNumber: {
    placeholder: 'Wpisz liczbę'
  },
  numberRange: {
    max: {
      placeholder: 'Max.',
      tooltip: 'Wprowadź maksymalną liczbę'
    },
    min: {
      placeholder: 'Min.',
      tooltip: 'Wprowadź minimalną liczbę'
    }
  },
  time: {
    placeholder: 'HH:mm'
  }
});

export type SharedFormStrings = typeof strings;
