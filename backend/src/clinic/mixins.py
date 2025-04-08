import logging

from django.contrib.admin import ModelAdmin
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.utils.translation import gettext as _
from rest_framework import serializers

# Konfiguracja loggera dla tego modułu
logger = logging.getLogger(__name__)


class MailSendingMixin:
    """
    Mixin dodający możliwość wysyłania wiadomości e-mail.

    Ten mixin udostępnia metodę do wysyłania e-maila z wykorzystaniem szablonu i kontekstu.
    Obsługuje również wyjątki, które mogą wystąpić podczas wysyłania wiadomości, i loguje je.
    """

    def send_email(self, subject, template_name, context, to_email):
        """
        Renderuje szablon e-maila z kontekstem i wysyła wiadomość.

        Argumenty:
            subject (str): Temat wiadomości.
            template_name (str): Ścieżka do szablonu e-maila.
            context (dict): Kontekst używany do renderowania szablonu.
            to_email (str): Adres e-mail odbiorcy.

        Wyjątki:
            serializers.ValidationError: W przypadku błędu podczas wysyłania e-maila.
        """
        try:
            message = render_to_string(template_name, context)
            email_message = EmailMessage(subject, message, to=[to_email])
            email_message.content_subtype = "html"
            email_message.send()
        except Exception as e:
            logger.error(
                f"Error sending email to {to_email}: {str(e)}", exc_info=True
            )

            raise serializers.ValidationError(
                {
                    "non_field_errors": [
                        _("Wystąpił błąd podczas wysyłania e-maila.")
                    ]
                }
            )


class FullnameAdminMixin(ModelAdmin):
    """
    Mixin dodający wyświetlanie imienia i nazwiska powiązanego użytkownika w panelu admina Django.

    Udostępnia metody do pobierania imienia i nazwiska z obiektu użytkownika oraz
    konfiguruje sortowanie i opis kolumn w panelu administracyjnym.
    """

    def user_first_name(self, obj):
        """
        Zwraca imię użytkownika powiązanego z danym obiektem.

        Argumenty:
            obj: Obiekt powiązany z użytkownikiem.

        Zwraca:
            str: Imię użytkownika.
        """
        return obj.user.first_name

    user_first_name.admin_order_field = (
        "user__first_name"  # Umożliwia sortowanie po kolumnie
    )
    user_first_name.short_description = _("first name")  # Nagłówek tabeli

    def user_last_name(self, obj):
        """
        Zwraca nazwisko użytkownika powiązanego z danym obiektem.

        Argumenty:
            obj: Obiekt powiązany z użytkownikiem.

        Zwraca:
            str: Nazwisko użytkownika.
        """
        return obj.user.last_name

    user_last_name.admin_order_field = (
        "user__last_name"  # Umożliwia sortowanie po kolumnie
    )
    user_last_name.short_description = _("last name")  # Nagłówek tabeli
