import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable, catchError, first, firstValueFrom, map, of, switchMap, tap, throwError } from 'rxjs';

import {
  AuthToken,
  ChangePasswordData,
  EmailVerificationData,
  LoginRequestData,
  LoginResponseData,
  RegisterRequestData,
  ResetPasswordConfirmData,
  ResetPasswordRequestData,
  ResetPasswordVerificationData,
  TokenLifetime,
  UserAuthData,
  UserRole
} from '@auth/types';

import { SessionTimerService } from '@layout/services';

import { AuthStorageService } from './auth-storage.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  // Przechowuje aktualnego użytkownika (null jeśli niezalogowany)
  private userSubject = new BehaviorSubject<UserAuthData | null>(this.authStorageService.getUser());
  private refreshSubject = new BehaviorSubject<boolean>(false);
  // Pamięć podręczna domyślnego czasu życia tokena (dostarczana z backendu)
  private defaultTokenLifetime: TokenLifetime;

  // Observable do subskrybowania aktualnego użytkownika
  user$ = this.userSubject.asObservable().pipe(map(user => (user ? new UserAuthData(user) : null)));

  // Subjecty do stanu inicjalizacji i błędu
  private initializedSubject = new BehaviorSubject<boolean>(false);
  private errorOccurredSubject = new BehaviorSubject<boolean>(false);

  // Wystawione jako Observable
  public initialized$ = this.initializedSubject.asObservable();
  public errorOccurred$ = this.errorOccurredSubject.asObservable();

  private isRefreshing = false;

  constructor(
    private authService: AuthService,
    private authStorageService: AuthStorageService,
    private router: Router,
    private sessionTimerService: SessionTimerService
  ) {}

  /**
   * Zmiana hasła dla zalogowanego użytkownika.
   */
  changePassword(data: ChangePasswordData): Observable<unknown> {
    return this.authService.changePassword(data);
  }

  /**
   * Ustawianie nowego hasła (na podstawie tokena i UID z maila):
   * - Po ustawieniu hasła następuje przekierowanie do strony głównej
   */
  confirmResetPassword(params: ResetPasswordVerificationData, data: ResetPasswordConfirmData): Observable<unknown> {
    return this.authService.confirmResetPassword(params, data).pipe(
      tap(() => {
        this.router.navigate(['/']);
      })
    );
  }

  /**
   * Ustawienie stanu autentykacji użytkownika po zalogowaniu lub odświeżeniu tokenów:
   * - Zapisuje tokeny i dane użytkownika w localStorage
   * - Aktualizuje stan obserwowalny użytkownika
   */
  private setAuthState(tokens: AuthToken, user: UserAuthData): void {
    this.authStorageService.storeAuthData(tokens, user);
    this.userSubject.next(user);
  }

  /**
   * Czyszczenie stanu autentykacji podczas wylogowania lub błędu sesji:
   * - Czyści dane z localStorage
   * - Zatrzymuje i resetuje timer sesji
   * - Resetuje obserwowalny stan użytkownika do null
   */
  private clearAuthState(): void {
    this.authStorageService.clearAuthData();
    this.sessionTimerService.clearAll();
    this.userSubject.next(null);
  }

  /**
   * Inicjalizacja lub odtworzenie timera sesji:
   * - Ustawia czas początkowy timera na podstawie tokena (iat) lub bieżącego czasu
   * - Odtwarza timer po odświeżeniu strony (restoreTimer: true) lub uruchamia nowy timer (restoreTimer: false)
   * - Po upływie czasu sesji automatycznie wymusza wylogowanie użytkownika
   */
  private setupSessionTimer(iat?: number, restoreTimer: boolean = false): void {
    const startTimestamp = iat || Date.now();
    this.sessionTimerService.setTokenStartTimestamp(startTimestamp);

    if (restoreTimer) {
      this.sessionTimerService.restoreTimer(() => this.forceLogout().subscribe());
    } else {
      this.sessionTimerService.startTimer(() => this.forceLogout().subscribe());
    }
  }

  /**
   * Logowanie użytkownika.
   * - Zapisuje dane w `localStorage`
   * - Ustawia timer sesji
   * - Pobiera domyślny czas życia tokena (jeśli nie był wcześniej pobrany)
   */
  login(data: LoginRequestData): Observable<LoginResponseData> {
    return this.authService.login(data).pipe(
      tap(({ tokens, user }) => this.setAuthState(tokens, user)),
      switchMap(response =>
        this.getDefaultTokenLifetime().pipe(
          tap(defaultTokenLifetime => this.sessionTimerService.setDefaultTokenLifetime(defaultTokenLifetime)),
          tap(() => this.setupSessionTimer()),
          tap(() => this.router.navigate(['/'])),
          map(() => response)
        )
      ),
      catchError(error => {
        this.clearAuthState();
        throw error;
      })
    );
  }

  /**
   * Wymuszone wylogowanie użytkownika:
   * - Wysyła email do API
   * - Czyści localStorage i timer
   * - Nawiguje do strony głównej
   */
  forceLogout(): Observable<unknown> {
    const user = this.getUser();
    return this.authService.forceLogout(user.email).pipe(
      tap(() => {
        this.router.navigate(['/']);
        this.clearAuthState();
      })
    );
  }

  /**
   * Wylogowanie użytkownika:
   * - Wysyła refresh token do API
   * - Czyści localStorage i timer
   * - Nawiguje do strony głównej
   */
  logout(): Observable<unknown> {
    const refresh = this.getRefreshToken();
    return this.authService.logout(refresh).pipe(
      tap(() => {
        this.sessionTimerService.setSessionActive(false);
        this.router.navigate(['/']);
        this.clearAuthState();
      })
    );
  }

  /**
   * Rejestracja nowego użytkownika.
   */
  register(data: RegisterRequestData): Observable<unknown> {
    return this.authService.register(data);
  }

  /**
   * Weryfikacja adresu e-mail (kliknięcie w link aktywacyjny).
   */
  verifyEmail(data: EmailVerificationData): Observable<unknown> {
    return this.authService.verifyEmail(data);
  }

  /**
   * Inicjowanie procesu resetowania hasła.
   */
  resetPassword(data: ResetPasswordRequestData): Observable<unknown> {
    return this.authService.resetPassword(data);
  }

  /**
   * Pobieranie danych użytkownika podczas startu aplikacji.
   */
  getUserInfo(): Observable<UserAuthData> {
    return this.authService.getUserInfo();
  }

  /**
   * Zwraca aktualny access token z localStorage.
   */
  getAccessToken(): string {
    return this.authStorageService.getAccessToken();
  }

  /**
   * Zwraca aktualny refresh token z localStorage.
   */
  getRefreshToken(): string {
    return this.authStorageService.getRefreshToken();
  }

  /**
   * Zwraca aktualnie zalogowanego użytkownika (lub null).
   */
  getUser(): UserAuthData {
    return this.userSubject.value;
  }

  /**
   * Zwraca rolę aktualnego użytkownika.
   */
  getUserRole(): UserRole {
    return this.authStorageService.getUserRole();
  }

  /**
   * Zwraca domyślny czas życia tokena (cache'owany po pierwszym pobraniu).
   */
  getDefaultTokenLifetime(): Observable<TokenLifetime> {
    return this.defaultTokenLifetime
      ? of(this.defaultTokenLifetime)
      : this.authService.getDefaultTokenLifetime().pipe(tap(lifetime => (this.defaultTokenLifetime = lifetime)));
  }

  /**
   * Odświeża access token za pomocą refresh tokena.
   * - Jeśli odświeżanie się nie uda, użytkownik zostaje wylogowany.
   * - Jeśli aktualnie trwa odświeżanie tokena, inne wywołania czekają na jego zakończenie.
   */
  refreshTokens(): Observable<AuthToken> {
    const refresh = this.getRefreshToken();

    if (!refresh) {
      return of(null);
    }

    // Obsługa współbieżnych prób odświeżenia tokena
    // Jeśli inna część aplikacji już rozpoczęła odświeżanie (np. inny request),
    // to nie należy wykonywać nowego żądania — zamiast tego inne czekają na wynik.
    if (this.isRefreshing) {
      return this.refreshSubject.pipe(
        // `refreshSubject` emituje `true`, jeśli refresh się powiódł, lub `false`, jeśli nie.
        switchMap(success => {
          if (success) {
            // Refresh zakończony sukcesem — zwrócenie zaktualizowanego tokena
            return of({ access: this.getAccessToken(), refresh: this.getRefreshToken() });
          } else {
            // Refresh zakończony niepowodzeniem — wyrzucenie błąd
            return throwError(() => new Error('Refresh failed'));
          }
        }),
        first() // Subskrypcja tylko pierwszą emisję z `refreshSubject`
      );
    }

    this.isRefreshing = true;

    return this.authService.refreshTokens(refresh).pipe(
      tap(({ access, refresh }) => {
        // Odświeżenie się powiodło — następuje zapisanie nowych tokenów i użytkownika
        const tokens = { access, refresh };
        this.setAuthState(tokens, this.getUser());

        // Restartowanie timera sesji z nowym `iat` (czasem rozpoczęcia)
        this.setupSessionTimer();

        // Emitowanie sukces do wszystkich oczekujących subskrybentów
        this.refreshSubject.next(true);
      }),
      catchError(error => {
        // Refresh się nie powiódł (np. token wygasł) — następuje wylogowanie użytkownika
        this.refreshSubject.next(false); // Emitowanie porażkę do oczekujących
        this.forceLogout().subscribe(); // Wylogowanie + przekierowanie
        return throwError(() => error); // Przekazanie błędu błąd dalej
      }),
      tap(() => {
        // Niezależnie od wyniku, następuje resetowanie flagi `isRefreshing`
        this.isRefreshing = false;
      })
    );
  }

  /**
   * Inicjalizacja stanu autoryzacji (np. po odświeżeniu strony).
   * - Pobiera dane użytkownika z backendu (jeśli token istnieje)
   * - Przywraca timer sesji
   */
  initializeAuthState(): Promise<void> {
    const access = this.getAccessToken();
    if (!access) {
      this.initializedSubject.next(true);
      this.errorOccurredSubject.next(false);
      this.userSubject.next(null);
      return Promise.resolve();
    }

    return firstValueFrom(
      this.getUserInfo().pipe(
        tap(user => this.setAuthState({ access, refresh: this.getRefreshToken() }, user)),
        switchMap(() => this.getDefaultTokenLifetime()),
        tap(lifetime => {
          this.initializedSubject.next(true);
          this.sessionTimerService.setDefaultTokenLifetime(lifetime);
          const existingTimestamp = this.sessionTimerService.getTokenStartTimestamp();
          const decoded = existingTimestamp ? null : this.decodeJwtToken(access);
          const iat = decoded?.iat ? decoded.iat * 1000 : existingTimestamp || Date.now();
          this.setupSessionTimer(iat, true);
        }),
        catchError(error => {
          this.errorOccurredSubject.next(true);
          this.forceLogout().subscribe();
          throw error;
        })
      )
    ).then(() => {});
  }

  /**
   * Dekoduje token JWT i zwraca zawartość payload jako obiekt.
   * W przypadku błędu dekodowania zwraca null.
   */
  private decodeJwtToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }
}
