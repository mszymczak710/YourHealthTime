from datetime import datetime, timezone

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.db import transaction
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.translation import gettext as _
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from clinic.auth.models import User
from clinic.auth.serializers import (
    ChangePasswordSerializer,
    EmailVerificationSerializer,
    ForceLogoutSerializer,
    LogoutSerializer,
    ResetPasswordConfirmSerializer,
    ResetPasswordSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserRegisterSerializer,
)
from clinic.mixins import MailSendingMixin


class RegisterView(MailSendingMixin, APIView):
    permission_classes = (AllowAny,)
    serializer_class = UserRegisterSerializer
    throttle_classes = (AnonRateThrottle,)

    @extend_schema(
        request=UserRegisterSerializer,
        responses={status.HTTP_201_CREATED: OpenApiResponse(response=None)},
    )
    def post(self, request):
        """
        Obsługa żądania POST rejestracji użytkownika.

        Weryfikacja danych użytkownika, tworzenie konta, wysyłanie e-maila weryfikacyjnego i zwrócenie odpowiedzi.
        """
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            user = serializer.save()

            if not user.email_confirmed:
                uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)
                verification_link = (
                    f"{settings.FRONTEND_URL}/verify-email/{uidb64}/{token}"
                )

                try:
                    self.send_email(
                        subject=_(
                            "[Your Health Time] Weryfikacja adresu e-mail"
                        ),
                        template_name="emails/email_verification.html",
                        context={
                            "user": user,
                            "verification_link": verification_link,
                        },
                        to_email=user.email,
                    )
                except Exception:
                    raise ValidationError(
                        {
                            "non_field_errors": _(
                                "Nie udało się wysłać maila weryfikacyjnego. Spróbuj ponownie później."
                            )
                        }
                    )

        return Response(status=status.HTTP_201_CREATED)


class VerifyEmailView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = EmailVerificationSerializer

    @extend_schema(
        request=EmailVerificationSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description="Adres e-mail został pomyślnie zweryfikowany.",
            )
        },
    )
    def get(self, request, uidb64, token):
        """
        Obsługa żądanie GET w celu weryfikacji adresu e-mail.

        Argumenty:
            request: Oryginalne żądanie HTTP.
            uidb64 (str): Zakodowane base64 ID użytkownika.
            token (str): Token służący do weryfikacji adresu e-mail.

        Zwraca:
            Response: Obiekt DRF Response z rezultatem weryfikacji.
        """
        serializer = self.serializer_class(
            data={"uidb64": uidb64, "token": token}
        )
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        user.email_confirmed = True
        user.is_active = True
        user.save()

        return Response(status=status.HTTP_200_OK)


class LoginView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = UserLoginSerializer
    throttle_classes = (AnonRateThrottle,)

    @extend_schema(
        request=UserLoginSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                response={
                    "type": "object",
                    "properties": {
                        "tokens": {
                            "refresh": {"type": "string"},
                            "access": {"type": "string"},
                        },
                        "user": {
                            "type": "object",
                            "properties": {
                                "email": {"type": "string", "format": "email"},
                                "first_name": {"type": "string"},
                                "last_name": {"type": "string"},
                                "role": {"type": "string"},
                                "profile_id": {"type": "string"},
                            },
                        },
                    },
                }
            )
        },
    )
    def post(self, request):
        """
        Logowanie użytkownika.

        Argumenty:
            request: Obiekt HttpRequest zawierający dane logowania.

        Zwraca:
            Response: Obiekt DRF Response zawierający tokeny JWT i dane użytkownika.
        """
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        user = authenticate(username=email, password=password)

        user.is_logged_in = True
        user.save()

        refresh = RefreshToken.for_user(user)
        user_serializer = UserProfileSerializer(user)

        response_data = {
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            "user": user_serializer.data,
        }

        return Response(response_data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = LogoutSerializer
    throttle_classes = (UserRateThrottle,)

    @extend_schema(
        request=LogoutSerializer,
        responses={status.HTTP_204_NO_CONTENT: None},
    )
    def post(self, request):
        """
        Wylogowanie użytkownika.

        Argumenty:
            request: Obiekt HttpRequest zawierający refresh token.

        Zwraca:
            Response: Obiekt DRF Response ze statusem 204 (No Content).
        """
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        user.is_logged_in = False
        user.save(update_fields=["is_logged_in"])

        return Response(status=status.HTTP_204_NO_CONTENT)


class ForceLogoutView(APIView):
    """
    Wymuszenie wylogowania użytkownika przez ustawienie flagi `is_logged_in` na False.

    Używane, gdy frontend wykryje wygaśnięcie sesji (np. nieważny refresh token)
    i musi powiadomić backend o konieczności wyczyszczenia stanu sesji.
    """

    permission_classes = (AllowAny,)

    @extend_schema(
        request=ForceLogoutSerializer,
        responses={
            status.HTTP_204_NO_CONTENT: None,
        },
    )
    def post(self, request):
        """
        Wymuszenie wylogowania użytkownika.

        Pobranie adresu e-mail z requestu, znalezienie użytkownika i ustawienie flagi `is_logged_in` na False.
        """
        serializer = ForceLogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.get_user()
        user.is_logged_in = False
        user.save(update_fields=["is_logged_in"])

        return Response(status=status.HTTP_204_NO_CONTENT)


class ResetPasswordView(MailSendingMixin, APIView):
    permission_classes = (AllowAny,)
    serializer_class = ResetPasswordSerializer
    throttle_classes = (AnonRateThrottle,)

    @extend_schema(
        request=ResetPasswordSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description="Link do resetowania hasła został wysłany.",
            )
        },
    )
    def post(self, request):
        """
        Wysłanie linku do resetowania hasła na adres e-mail użytkownika.
        """
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_password_url = (
            f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
        )

        self.send_email(
            subject=_("[Your Health Time] Resetowanie hasła"),
            template_name="emails/reset_password.html",
            context={"reset_password_url": reset_password_url},
            to_email=user.email,
        )

        user.password_reset_sent_at = datetime.now(timezone.utc)
        user.save()

        return Response(status=status.HTTP_200_OK)


class ResetPasswordConfirmView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = ResetPasswordConfirmSerializer
    throttle_classes = (AnonRateThrottle,)

    @extend_schema(
        request=ResetPasswordConfirmSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description="Hasło zostało zresetowane i zastąpione nowym.",
            )
        },
    )
    def post(self, request, *args, **kwargs):
        """
        Resetowanie hasła użytkownika.
        """
        try:
            uid = force_str(urlsafe_base64_decode(kwargs["uidb64"]))
            user = User.objects.get(pk=uid)
            token = kwargs["token"]

            serializer = self.serializer_class(
                data=request.data,
                context={
                    "user": user,
                    "token": token,
                    "uidb64": kwargs["uidb64"],
                },
            )

            serializer.is_valid(raise_exception=True)

            user.set_password(serializer.validated_data["password"])
            user.save()

            return Response(status=status.HTTP_200_OK)

        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {
                    "non_field_errors": _(
                        "Nieprawidłowy UID lub użytkownik nie znaleziony."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class ChangePasswordView(APIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = ChangePasswordSerializer
    throttle_classes = (UserRateThrottle,)

    @extend_schema(
        request=ChangePasswordSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description="Hasło zostało pomyślnie zaktualizowane.",
            )
        },
    )
    def post(self, request, *args, **kwargs):
        """
        Zmiana hasła użytkownika.
        """
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )

        serializer.is_valid(raise_exception=True)

        new_password = serializer.validated_data["password"]
        request.user.set_password(new_password)
        request.user.save()

        return Response(status=status.HTTP_200_OK)


class TokenLifetimeView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description="Maksymalny czas życia tokena w sekundach",
                response={
                    "type": "object",
                    "properties": {
                        "access_token_lifetime_seconds": {"type": "integer"}
                    },
                },
            )
        },
    )
    def get(self, request):
        """
        Zwrócenie czasu życia tokena dostępu w sekundach.
        """
        access_token_lifetime = settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"]
        return Response(
            {
                "access_token_lifetime_seconds": int(
                    access_token_lifetime.total_seconds()
                )
            }
        )


class UserInfoView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description="Dane użytkownika",
                response=UserProfileSerializer,
            )
        },
    )
    def get(self, request):
        """
        Pobranie danych zalogowanego użytkownika.
        """
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
