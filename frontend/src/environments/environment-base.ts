export const environmentBase = {
  apiUrl: 'http://localhost:8000',
  autocomplete: {
    debounce: 400,
    limit: 10,
    minHintChars: 3
  },
  backendDateFormat: 'YYYY-MM-DD',
  backendDateTimeFormat: 'YYYY-MM-DD HH:mm',
  backendTimeFormat: 'HH:mm',
  dateFormat: 'dd.MM.yyyy',
  dateFormatMoment: 'DD.MM.YYYY',
  dateTimeFormat: 'dd.MM.yyyy HH:mm:ss',
  dateTimeFormatMoment: 'DD.MM.YYYY HH:mm:ss',
  emptyPlaceholder: '---',
  inputNumber: {
    max: 1008,
    min: 0,
    step: 1
  },
  list: {
    limit: 10,
    limitOptions: [5, 10, 25, 100],
    ordering: {
      column: 'readable_id',
      direction: 'desc'
    }
  },
  recaptchaSiteKey: '6LdOt_MqAAAAAEb1wdriHu-dgTmKrzUOfQg7LLoQ',
  select: {
    optionLabelKey: 'label',
    optionValueKey: 'value'
  },
  timezone: 'Europe/Warsaw',
  tokenExpiryBufferSeconds: 60
};
