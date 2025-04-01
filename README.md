# Your Health Time

## Wprowadzenie

Your Health Time to system zarządzania kliniką opracowany jako projekt inżynierski z zakresu Informatyki na Wydziale Matematyki i Informatyki Uniwersytetu Mikołaja Kopernika w Toruniu. Celem projektu jest zaprojektowanie i implementacja aplikacji internetowej do zarządzania kliniką, która spełnia potrzeby pacjentów, lekarzy oraz administratorów. Aplikacja umożliwia pacjentom dostęp do historii wizyt i recept, lekarzom zarządzanie wizytami i receptami, a administratorom kontrolę nad procesami.

## Stos technologiczny

Aplikacja Your Health Time wykorzystuje solidny stos technologiczny, w tym:

- **PostgreSQL 16**: Potężny, otwartoźródłowy system baz danych obiektowo-relacyjnych. [Więcej o PostgreSQL 16](https://www.postgresql.org/)
- **Django 5.0**: Wysokopoziomowy framework webowy dla Pythona, który wspiera szybki rozwój i czysty, pragmatyczny design. [Więcej o Django 5.0](https://www.djangoproject.com/)
- **Angular 17**: Platforma do budowania aplikacji webowych na urządzenia mobilne i komputery z użyciem TypeScript/JavaScript oraz innych języków. [Więcej o Angular 17](https://angular.io/)

## Konfiguracja środowiska

Aby skonfigurować środowisko dla Your Health Time, należy skopiować zawartość pliku `.env.sample` do nowego pliku o nazwie `.env` i dostosować wartości zmiennych środowiskowych do własnych potrzeb. Plik `.env` będzie zawierał wszystkie niezbędne informacje konfiguracyjne wymagane przez aplikację.

### Krok po kroku

1. **Przejdź do katalogu `docker`**:
   Przed skopiowaniem pliku konfiguracyjnego, przejdź do katalogu `docker` w ramach projektu:

   ```bash
   cd docker
   ```

2. **Skopiuj plik konfiguracyjny**:
   Skopiuj plik `.env.sample` do nowego pliku `.env` w głównym katalogu projektu.

   ```bash
   cp .env.sample .env
   ```

3. **Edytuj plik `.env`**:
   Otwórz plik `.env` w edytorze tekstu i uzupełnij następujące zmienne środowiskowe:

   - `DB_NAME`: Nazwa bazy danych.
   - `DB_USER`: Nazwa użytkownika bazy danych.
   - `DB_PASSWORD`: Hasło użytkownika bazy danych.
   - `DB_HOST`: Host bazy danych (użyj 'db' dla Dockera).
   - `DB_PORT`: Port bazy danych (domyślnie 5432 dla PostgreSQL).
   - `DJANGO_SECRET_KEY`: Sekretny klucz Django.
   - `DJANGO_SUPERUSER_FIRST_NAME`: Imię superużytkownika Django.
   - `DJANGO_SUPERUSER_LAST_NAME`: Nazwisko superużytkownika Django.
   - `DJANGO_SUPERUSER_EMAIL`: Email superużytkownika Django.
   - `DJANGO_SUPERUSER_PASSWORD`: Hasło superużytkownika Django.
   - `EMAIL_HOST`: Host serwera e-mail (np. smtp.gmail.com).
   - `EMAIL_PORT`: Port serwera e-mail (domyślnie 587).
   - `EMAIL_USE_TLS`: Czy używać TLS (ustaw na True).
   - `EMAIL_HOST_USER`: Użytkownik hosta e-mail.
   - `EMAIL_HOST_PASSWORD`: Hasło hosta e-mail.
   - `DEFAULT_FROM_EMAIL`: Domyślny adres e-mail nadawcy.
   - `EMAIL_FILE_PATH`: Ścieżka do przechowywania wiadomości e-mail (do testów).
   - `RECAPTCHA_SECRET_KEY`: Sekretny klucz reCAPTCHA.
   - `RECAPTCHA_VERIFY_URL`: URL do weryfikacji reCAPTCHA.
   - `TEST_DB_NAME`: Nazwa bazy danych testowej.
   - `FRONTEND_URL`: Bazowy URL aplikacji frontendowej (np. http://localhost:4200 dla lokalnego środowiska).

4. **Zapisz plik `.env`**:
   Po wprowadzeniu i zapisaniu zmian w pliku `.env`, aplikacja będzie gotowa do uruchomienia.

## Uruchamianie aplikacji bez Docker Compose

Jeśli nie chcesz korzystać z Docker Compose, możesz uruchomić aplikację ręcznie:

### **1. Utwórz środowisko wirtualne**

```bash
python -m venv .venv
source .venv/bin/activate  # Na Windows użyj .venv\Scripts\activate
```

### **2. Zainstaluj zależności**

```bash
pip install -r requirements.txt
```

Dodatkowo zainstaluj projekt w trybie edytowalnym, aby upewnić się, że zależności i pakiety są poprawnie połączone:

```bash
pip install -e .
```

To polecenie zapewnia instalację pakietu w trybie deweloperskim, dzięki czemu zmiany w kodzie będą od razu widoczne bez konieczności ponownej instalacji.

## **3. Skonfiguruj bazę danych**

Przed konfiguracją aplikacji, należy utworzyć bazę danych PostgreSQL, użytkownika oraz przyznać odpowiednie uprawnienia.

### **Połącz się z PostgreSQL**

Najpierw zaloguj się do serwera PostgreSQL:

```bash
psql -U postgres
```

### **Utwórz użytkownika bazy danych**

Wykonaj poniższe polecenie:

```sql
CREATE USER '<your_database_username>' WITH PASSWORD '<your_database_password>';
```

### **Utwórz bazy danych**

Utwórz główną bazę danych:

```sql
CREATE DATABASE '<your_database_name>' OWNER '<your_database_username>';
```

Jeśli aplikacja wymaga oddzielnej bazy testowej:

```sql
CREATE DATABASE '<your_test_database_name>' OWNER '<your_database_username>';
```

### **Przyznaj uprawnienia użytkownikowi**

```sql
GRANT ALL PRIVILEGES ON DATABASE '<your_database_name>' TO '<your_database_username>';
GRANT ALL PRIVILEGES ON DATABASE '<your_test_database_name>' TO '<your_database_username>';
```

Można też jawnie ustawić właściciela:

```sql
ALTER DATABASE '<your_database_name>' OWNER TO  '<your_database_username>';
ALTER DATABASE '<your_test_database_name>' OWNER TO  '<your_database_username>';
```

### **Zapewnij dostęp do schematów**

Połącz się z bazą:

```bash
psql -U  '<your_database_username>' -d  '<your_database_name>'
```

Następnie:

```sql
GRANT ALL ON SCHEMA public TO  '<your_database_username>';
```

### **Skonfiguruj połączenie w pliku `.env`**

Upewnij się, że plik `.env` zawiera poprawne dane połączenia:

```bash
DB_NAME='<your_database_name>'
DB_USER='<your_database_username>'
DB_PASSWORD='<your_database_password>'
DB_HOST='<your_database_host>' # 'db' gdy używasz Docker Compose
DB_PORT=5432

TEST_DB_NAME='<your_test_database_name>'
```

Zastosuj migracje:

```bash
python manage.py migrate
```

### **4. Uruchom komendę `create_sequences`**

```bash
python manage.py create_sequences
```

Komenda ta tworzy sekwencje bazodanowe dla pól autoinkrementujących.

### **5. Uruchom komendę `load_data`**

```bash
python manage.py load_data
```

Komenda ładuje dane początkowe wymagane do działania aplikacji.

### **6. Utwórz superużytkownika**

```bash
python manage.py createsuperuser
```

### **7. Uruchom serwer deweloperski**

```bash
python manage.py runserver
```

Aplikacja będzie dostępna pod adresem [http://localhost:8000/](http://localhost:8000/).

### Uruchamianie frontendu

Aby uruchomić frontend Angular:

### **1. Przejdź do katalogu frontend**

```bash
cd frontend
```

### **2. Zainstaluj zależności**

Upewnij się, że masz zainstalowane Node.js i npm:

```bash
npm install
```

### **3. Uruchom serwer deweloperski**

```bash
ng serve
```

Frontend będzie dostępny pod adresem [http://localhost:4200/](http://localhost:4200/).

## Uruchamianie aplikacji z Docker Compose

Aby uruchomić Your Health Time za pomocą `docker-compose`, wykonaj następujące kroki:

⚠️ Zalecana wersja: Zalecamy użycie Docker Compose w wersji v2.33.1 dla najlepszej kompatybilności.
👉 [Docker Compose v2.33.1](https://github.com/docker/compose/releases/tag/v2.33.1)

1. **Sprawdź wersję Docker Compose**

```bash
docker compose version
```

2. **Zbuduj kontenery**:

```bash
docker-compose build
```

3. **Uruchom `docker-compose`**:

```bash
docker-compose up
```

4. **Dostęp do aplikacji**:

Aplikacja będzie dostępna pod adresem [http://localhost:8000/api/](http://localhost:8000/api/)

5. **Dostęp do panelu administracyjnego Django**:

Panel administracyjny Django znajduje się pod adresem [http://localhost:8000/admin/](http://localhost:8000/admin/)

- **Email**: Adres e-mail podany w `DJANGO_SUPERUSER_EMAIL`
- **Hasło**: Hasło z `DJANGO_SUPERUSER_PASSWORD`

## Testowanie

### **Uruchamianie testów bez Docker Compose**

```bash
pytest <full_path_to_test>
```

### **Uruchamianie testów z Docker Compose**

```bash
docker-compose exec -it api pytest <full_path_to_test>
```

Zamień `<full_path_to_test>` na rzeczywistą ścieżkę do pliku z testami.

## Pomoc

W przypadku problemów z konfiguracją lub uruchomieniem aplikacji Your Health Time prosimy o kontakt: [mszymczak710@o2.pl](mailto:mszymczak710@o2.pl)
