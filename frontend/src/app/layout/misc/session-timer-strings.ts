export const sessionTimerStrings = {
  sessionTimer: {
    label: 'Czas trwania sesji:',
    refreshToken: {
      succeed: 'Pomyślnie odświeżono czas trwania sesji'
    },
    sessionExpired: 'Twoja sesja wygasła.',
    warn: 'Sesja wygaśnie za %d sekund',
    tooltip: 'Odśwież sesję'
  }
};

export type SessionTimerStrings = typeof sessionTimerStrings;
