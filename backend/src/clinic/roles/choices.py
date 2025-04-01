from django.db import models
from django.utils.translation import gettext_lazy as _


class Gender(models.TextChoices):
    MALE = "M", _("Mężczyzna")
    FEMALE = "K", _("Kobieta")
