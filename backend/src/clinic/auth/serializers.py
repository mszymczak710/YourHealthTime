from datetime import datetime, timedelta, timezone

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from clinic.auth.choices import Role
from clinic.auth.recaptcha import verify_recaptcha
from clinic.roles.models import Patient
from clinic.serializers import AddressWriteSerializer
from clinic.validators import PhoneNumberValidator, pesel_validator

User = get_user_model()


class UserReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("email", "first_name", "last_name")
        read_only_fields = fields


class UserProfileSerializer(UserReadSerializer):
    profile_id = serializers.SerializerMethodField()

    class Meta(UserReadSerializer.Meta):
        fields = UserReadSerializer.Meta.fields + ("role", "profile_id")
        read_only_fields = fields

    def get_profile_id(self, obj):
        if obj.role == Role.PATIENT and hasattr(obj, "patient"):
            return obj.patient.id
        elif obj.role == Role.DOCTOR and hasattr(obj, "doctor"):
            return obj.doctor.id
        elif obj.role == Role.NURSE and hasattr(obj, "nurse"):
            return obj.nurse.id
        elif obj.role == Role.ADMIN:
            return obj.id
        return None


class UserWriteSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        min_length=7,
        max_length=255,
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message=_("Ten adres e-mail jest już używany."),
                lookup="iexact",
            )
        ],
    )

    class Meta:
        model = User
        fields = ("email", "first_name", "last_name")


class PasswordBaseSerializer(serializers.Serializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=(validate_password,),
    )
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        """
        Sprawdzenie, czy pola password i password_confirm są zgodne.

        Argumenty:
            data (dict): Dane wejściowe dla serializera.

        Zwraca:
            dict: Zweryfikowane dane bez pola password_confirm.

        Wyjątki:
            ValidationError: Jeśli hasła się nie zgadzają.
        """
        password = data.get("password")
        password_confirm = data.get("password_confirm")
        if password != password_confirm:
            raise serializers.ValidationError(
                {"password_confirm": _("Hasła muszą być identyczne.")}
            )

        data.pop("password_confirm", None)

        return data


class UserRegisterSerializer(
    UserWriteSerializer, PasswordBaseSerializer, serializers.ModelSerializer
):
    recaptcha_response = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=Role.choices, required=False)
    pesel = serializers.CharField(max_length=11, validators=(pesel_validator,))
    phone_number = serializers.CharField(
        min_length=7, max_length=15, validators=(PhoneNumberValidator,)
    )
    address = AddressWriteSerializer()

    class Meta(UserWriteSerializer.Meta):
        fields = UserWriteSerializer.Meta.fields + (
            "password",
            "password_confirm",
            "recaptcha_response",
            "role",
            "pesel",
            "phone_number",
            "address",
        )

    def validate_recaptcha_response(self, value):
        """Walidacja odpowiedzi reCAPTCHA."""
        if not verify_recaptcha(value):
            raise serializers.ValidationError(
                _("Nieprawidłowa reCAPTCHA. Spróbuj ponownie.")
            )
        return value

    def validate_pesel(self, value):
        """Sprawdzenie unikalności numeru PESEL dla roli pacjenta."""
        role = self.initial_data.get("role", Role.PATIENT)

        if (
            role == Role.PATIENT
            and Patient.objects.filter(pesel=value).exists()
        ):
            raise serializers.ValidationError(
                _(
                    "Podane informacje są niekompletne lub nieprawidłowe. Sprawdź i wprowadź je ponownie."
                )
            )
        return value

    def validate(self, data):
        """
        Weryfikacja poprawności danych rejestracyjnych użytkownika.
        """
        request = self.context["request"]
        if request.user.is_authenticated:
            raise serializers.ValidationError(
                {
                    "non_field_errors": [
                        _("Jesteś już zarejestrowany i zalogowany.")
                    ]
                }
            )

        return super().validate(data)

    def create(self, validated_data):
        """
        Tworzenie nowej instancji użytkownika na podstawie zweryfikowanych danych.
        """
        password = validated_data.pop("password")
        validated_data.pop("password_confirm", None)
        validated_data.pop("recaptcha_response", None)

        role = validated_data.pop("role", Role.PATIENT)
        pesel = validated_data.pop("pesel", None)
        phone_number = validated_data.pop("phone_number", None)
        address_data = validated_data.pop("address", None)

        if role in (Role.ADMIN, Role.DOCTOR, Role.NURSE):
            validated_data["email_confirmed"] = True
            validated_data["is_active"] = True

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if role == Role.PATIENT:
            address = (
                self.create_address(address_data) if address_data else None
            )
            Patient.objects.create(
                user=user,
                pesel=pesel,
                phone_number=phone_number,
                address=address,
            )

        return user

    def create_address(self, address_data):
        """
        Tworzenie instancji adresu na podstawie przekazanych danych.
        """
        address_serializer = AddressWriteSerializer(data=address_data)
        address_serializer.is_valid(raise_exception=True)
        return address_serializer.save()


class EmailVerificationSerializer(serializers.Serializer):
    uidb64 = serializers.CharField(write_only=True)
    token = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """
        Weryfikacja UID i token w celu potwierdzenia adresu e-mail.
        """
        uidb64 = attrs.get("uidb64")
        token = attrs.get("token")

        try:
            user_id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=user_id)
        except (User.DoesNotExist, ValueError, TypeError):
            raise serializers.ValidationError(
                {
                    "non_field_errors": _(
                        "Nieprawidłowy identyfikator użytkownika."
                    )
                },
                code="invalid_uid",
            )

        if user.email_confirmed:
            raise serializers.ValidationError(
                {
                    "non_field_errors": [
                        _("Adres e-mail został już zweryfikowany.")
                    ]
                },
                code="already_verified",
            )

        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError(
                {
                    "non_field_errors": _(
                        "Token jest nieprawidłowy lub wygasł."
                    )
                },
                code="invalid_token",
            )

        attrs["user"] = user
        return attrs


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        """
        Szprawdzenie adresu e-mail i hasła, weryfikacja próbę logowania użytkownika.
        """
        user = User.objects.filter(email=data["email"]).first()

        if not user or not user.check_password(data["password"]):
            raise serializers.ValidationError(
                {"non_field_errors": _("Niepoprawny adres e-mail lub hasło.")}
            )

        if user.is_logged_in:
            raise serializers.ValidationError(
                {"non_field_errors": _("Użytkownik jest już zalogowany.")}
            )

        if not user.is_active or not user.email_confirmed:
            raise PermissionDenied(
                {"non_field_errors": _("Użytkownik nie jest aktywny.")}
            )

        return data


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(write_only=True, required=False)

    def validate(self, data):
        """
        Werygikacja tokenu odświeżającego i pobieranie powiązanego użytkownika.
        """
        refresh = data.get("refresh")

        if not refresh:
            raise serializers.ValidationError(
                {"non_field_errors": _("Wymagany jest token odświeżający.")}
            )

        try:
            token = RefreshToken(refresh)
            user_id = token.payload.get("user_id", None)
            if not user_id:
                raise serializers.ValidationError(
                    {
                        "non_field_errors": _(
                            "Token jest nieprawidłowy lub nie zawiera identyfikatora użytkownika."
                        )
                    }
                )

            user = User.objects.get(id=user_id)

            token.set_jti()
            token.set_exp()

        except (InvalidToken, TokenError):
            raise serializers.ValidationError(
                {"non_field_errors": _("Token jest nieprawidłowy lub wygasł.")}
            )
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {"non_field_errors": _("Użytkownik nie istnieje.")}
            )

        data["user"] = user
        data["refresh"] = str(token)
        return data


class ForceLogoutSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    _user = None

    def validate(self, data):
        """
        Weryfikacja istnienia użytkownika na podstawie podanego adresu e-mail.
        """
        email = data.get("email")

        if not email:
            raise serializers.ValidationError(
                {"non_field_errors": _("Nieprawidłowe dane.")}
            )

        try:
            self._user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {
                    "non_field_errors": _(
                        "Użytkownik o podanym adresie e-mail nie istnieje."
                    )
                }
            )
        return data

    def get_user(self):
        return self._user


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)
    recaptcha_response = serializers.CharField(write_only=True)

    def validate(self, data):
        """
        Sprawdzenie poprawności adresu e-mail i czy użytkownik potwierdził swój adres e-mail.
        """
        user = User.objects.filter(email=data["email"]).first()

        if not user:
            raise serializers.ValidationError(
                {"non_field_errors": _("Nieprawidłowy adres e-mail.")}
            )

        if not user.email_confirmed:
            raise PermissionDenied(
                {
                    "non_field_errors": _(
                        "Aby zresetować hasło, najpierw potwierdź swój adres e-mail."
                    )
                }
            )

        data["user"] = user
        return data

    def validate_recaptcha_response(self, value):
        """
        Weryfikacja odpowiedzi reCAPTCHA.
        """
        if not verify_recaptcha(value):
            raise serializers.ValidationError(
                _("Nieprawidłowa reCAPTCHA. Spróbuj ponownie.")
            )

        return value


class ResetPasswordConfirmSerializer(PasswordBaseSerializer):
    def validate(self, data):
        data = super().validate(data)

        user = self.context.get("user")
        token = self.context.get("token")

        if not user:
            raise serializers.ValidationError(
                {
                    "non_field_errors": _(
                        "Nieprawidłowy UID lub użytkownik nie znaleziony."
                    )
                }
            )

        if not user.is_active:
            raise serializers.ValidationError(
                {
                    "non_field_errors": _(
                        "Użytkownik jest nieaktywny. Skontaktuj się z pomocą techniczną, aby uzyskać wsparcie."
                    )
                }
            )
        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError(
                {
                    "non_field_errors": _(
                        "Link do resetowania hasła jest nieprawidłowy lub wygasł. Proszę poprosić o nowy."
                    )
                }
            )

        if user.password_reset_sent_at:
            time_since_reset = (
                datetime.now(timezone.utc) - user.password_reset_sent_at
            )
            if time_since_reset > timedelta(hours=24):
                raise serializers.ValidationError(
                    {
                        "non_field_errors": _(
                            "Link do resetowania hasła wygasł. Proszę poprosić o nowy."
                        )
                    }
                )

        return data


class ChangePasswordSerializer(PasswordBaseSerializer, serializers.Serializer):
    old_password = serializers.CharField(write_only=True, min_length=8)

    def validate_old_password(self, value):
        """
        Sprawdzenie zgodności starego hasła z aktualnym hasłem użytkownika.
        """
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError(_("Nieprawidłowe hasło."))
        return value
