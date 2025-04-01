from django.contrib.auth.models import BaseUserManager
from django.utils.translation import gettext_lazy as _

from clinic.auth.choices import Role


class UserManager(BaseUserManager):
    def _create_user(
        self, email, first_name, last_name, password, **extra_fields
    ):
        """
        Create and return a user with the given email, first name, last name, and password.
        """
        if not email:
            raise ValueError(_("Adres e-mail musi zostać podany"))
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            **extra_fields,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(
        self, email, first_name, last_name, password=None, **extra_fields
    ):
        extra_fields.setdefault("role", Role.PATIENT)
        return self._create_user(
            email, first_name, last_name, password, **extra_fields
        )

    def create_superuser(
        self, email, first_name, last_name, password=None, **extra_fields
    ):
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("email_confirmed", True)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", Role.ADMIN)
        return self._create_user(
            email, first_name, last_name, password, **extra_fields
        )
