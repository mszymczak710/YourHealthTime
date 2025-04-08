from django.db import models
from django.utils.translation import gettext_lazy as _


class Role(models.TextChoices):
    PATIENT = "P", _("Patient")
    NURSE = "N", _("Nurse")
    DOCTOR = "D", _("Doctor")
    ADMIN = "A", _("Admin")
