import uuid

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import MinLengthValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

from clinic.auth.choices import Role
from clinic.auth.managers import UserManager
from clinic.fields import AutoIncrementField
from clinic.validators import FirstNameValidator, LastNameValidator


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(_("id"), primary_key=True, default=uuid.uuid4)
    readable_id = AutoIncrementField(_("readable id"), unique=True)
    email = models.EmailField(
        _("email address"),
        max_length=255,
        unique=True,
        validators=[MinLengthValidator(7)],
    )
    email_confirmed = models.BooleanField(_("email confirmed"), default=False)
    first_name = models.CharField(
        _("first name"),
        max_length=30,
        validators=[FirstNameValidator, MinLengthValidator(3)],
    )
    last_name = models.CharField(
        _("last name"),
        max_length=30,
        validators=[LastNameValidator, MinLengthValidator(2)],
    )
    register_date = models.DateTimeField(_("register date"), auto_now_add=True)
    is_active = models.BooleanField(_("is active"), default=False)
    is_logged_in = models.BooleanField(
        _("is logged in"),
        default=False,
    )
    is_staff = models.BooleanField(_("is staff"), default=False)
    is_superuser = models.BooleanField(_("is superuser"), default=False)
    password_reset_sent_at = models.DateTimeField(
        _("password reset sent at"), null=True
    )
    role = models.CharField(
        _("role"), max_length=1, choices=Role.choices, default=Role.PATIENT
    )

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name", "role"]

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.full_name} ({self.email})"
