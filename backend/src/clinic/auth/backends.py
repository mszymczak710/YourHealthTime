from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend


class EmailBackend(ModelBackend):
    """
    Backend uwierzytelniania pozwalający na logowanie za pomocą adresu e-mail.

    Dziedziczy po ModelBackend i nadpisuje metodę `authenticate`, aby umożliwić
    logowanie użytkowników przy użyciu adresu e-mail zamiast nazwy użytkownika.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Uwierzytelnia użytkownika na podstawie adresu e-mail jako nazwy użytkownika.
        """
        user_model = get_user_model()
        try:
            # Próba pobrania użytkownika po polu e-mail w modelu użytkownika.
            user = user_model.objects.get(email=username)
        except user_model.DoesNotExist:
            # Jeśli użytkownik nie istnieje, zwracamy None.
            return None
        else:
            # Sprawdzanie poprawności hasła i czy użytkownik może się uwierzytelnić.
            if user.check_password(password) and self.user_can_authenticate(
                user
            ):
                return user
        # Jeśli hasło jest niepoprawne, zwracamy None.
        return None
