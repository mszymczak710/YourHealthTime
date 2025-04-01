import requests

from core import settings


def verify_recaptcha(response):
    """
    Weryfikuje odpowiedź reCAPTCHA przy użyciu usługi reCAPTCHA.
    """
    # Przygotowanie danych do żądania weryfikacyjnego
    data = {
        "secret": settings.RECAPTCHA_SECRET_KEY,  # Klucz tajny do weryfikacji po stronie serwera
        "response": response,  # Token odpowiedzi z widżetu reCAPTCHA po stronie klienta
    }

    # Wykonanie żądania POST do usługi weryfikacji reCAPTCHA z danymi
    response = requests.post(settings.RECAPTCHA_VERIFY_URL, data=data)

    # Przetworzenie odpowiedzi JSON zwróconą przez usługę reCAPTCHA
    result = response.json()

    # Zwrócenie  wartości 'success', która informuje, czy wyzwanie reCAPTCHA zostało zaliczone
    return result.get("success")
