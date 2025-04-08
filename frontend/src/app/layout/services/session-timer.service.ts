import { Injectable } from '@angular/core';

import { TokenLifetime } from '@auth/types';

@Injectable({
  providedIn: 'root'
})
export class SessionTimerService {
  private timeoutId: any = null;
  private isActiveSession = false;

  // Klucz używany do przechowywania czasu startu tokena w localStorage
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private readonly START_TIMESTAMP_KEY = 'token_start_timestamp';

  // Domyślny czas życia access tokena (w sekundach, minutach)
  private defaultTokenLifetime: TokenLifetime = null;

  /**
   * Ustawia domyślny czas życia tokena, otrzymany z backendu.
   */
  setDefaultTokenLifetime(defaultTokenLifetime: TokenLifetime): void {
    this.defaultTokenLifetime = defaultTokenLifetime;
  }

  /**
   * Zapisuje czas rozpoczęcia sesji w localStorage (jako timestamp).
   */
  setTokenStartTimestamp(timestamp: number): void {
    localStorage.setItem(this.START_TIMESTAMP_KEY, timestamp.toString());
  }

  /**
   * Odczytuje czas rozpoczęcia sesji z localStorage.
   */
  getTokenStartTimestamp(): number | null {
    const value = localStorage.getItem(this.START_TIMESTAMP_KEY);
    return value ? parseInt(value, 10) : null;
  }

  /**
   * Usuwa timestamp rozpoczęcia sesji z localStorage.
   */
  clearTokenStartTimestamp(): void {
    localStorage.removeItem(this.START_TIMESTAMP_KEY);
  }

  /**
   * Rozpoczyna licznik sesji od teraz, ustawiając timeout wygaśnięcia sesji.
   * Używa domyślnego czasu życia tokena.
   */
  startTimer(callback: () => void): void {
    if (!this.defaultTokenLifetime) {
      return;
    }

    this.setSessionActive();
    const timestamp = Date.now();
    this.setTokenStartTimestamp(timestamp);
    this.setTimerFromTimestamp(timestamp, callback);
  }

  /**
   * Przywraca licznik sesji po odświeżeniu strony lub wejściu z pamięci.
   */
  restoreTimer(callback: () => void): void {
    const timestamp = this.getTokenStartTimestamp();
    if (!timestamp || !this.defaultTokenLifetime) {
      return;
    }

    this.setSessionActive();
    this.setTimerFromTimestamp(timestamp, callback);
  }

  /**
   * Ustawia licznik od podanego czasu startu (używane przez start/restore).
   */
  private setTimerFromTimestamp(timestamp: number, callback: () => void): void {
    const elapsed = Date.now() - timestamp;
    const duration = this.defaultTokenLifetime.access_token_lifetime_seconds * 1000;
    const remaining = duration - elapsed;

    if (remaining === 0) {
      setTimeout(() => callback(), 300);
      return;
    }

    this.clearTimer();
    this.timeoutId = setTimeout(() => {
      callback();
    }, remaining);
  }

  /**
   * Zwraca liczbę sekund pozostałych do końca sesji.
   */
  getSecondsRemaining(): number | null {
    const timestamp = this.getTokenStartTimestamp();
    if (!timestamp || !this.defaultTokenLifetime) {
      return null;
    }

    const elapsed = Math.floor((Date.now() - timestamp) / 1000);
    return Math.max(this.defaultTokenLifetime.access_token_lifetime_seconds - elapsed, 0);
  }

  /**
   * Czyści aktualnie działający timeout (bez usuwania timestampu).
   */
  clearTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Czyści wszystko: timeout oraz timestamp w localStorage.
   */
  clearAll(): void {
    this.clearTimer();
    this.clearTokenStartTimestamp();
  }

  /**
   * Pomocnicza metoda do formatowania czasu w stylu MM:SS.
   */
  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  setSessionActive(active = true): void {
    this.isActiveSession = active;
  }

  /**
   * Zwraca informację czy jest aktywna sesja użytkownika
   */
  isSessionActive(): boolean {
    return this.isActiveSession;
  }
}
