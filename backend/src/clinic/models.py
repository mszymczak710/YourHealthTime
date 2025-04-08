import uuid

from django.core.validators import MinLengthValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

from clinic.auth.models import User  # noqa: F401
from clinic.fields import AutoIncrementField
from clinic.validators import (
    ApartmentNumberValidator,
    CityValidator,
    HouseNumberValidator,
    PostcodeValidator,
    StreetValidator,
)


class BaseModel(models.Model):
    """
    Abstrakcyjny model bazowy, który zapewnia pole ID oraz czytelny identyfikator innym modelom.

    ID to pole typu UUID, zapewniające unikalny identyfikator dla każdej instancji.
    readable_id to autoinkrementujące się pole, które dostarcza przyjazny dla użytkownika numer.
    """

    id = models.UUIDField(
        _("id"), primary_key=True, default=uuid.uuid4
    )  # Globalnie unikalny identyfikator
    readable_id = AutoIncrementField(
        _("readable id"), unique=True
    )  # Przyjazny użytkownikowi unikalny numer

    class Meta:
        abstract = True  # Oznacza, że ten model nie będzie miał własnej tabeli w bazie danych


class Address(models.Model):
    street = models.CharField(
        _("street"),
        max_length=50,
        validators=(StreetValidator, MinLengthValidator(3)),
    )
    house_number = models.CharField(
        _("house number"), max_length=4, validators=(HouseNumberValidator,)
    )
    apartment_number = models.CharField(
        _("apartment number"),
        max_length=4,
        blank=True,
        null=True,
        validators=(ApartmentNumberValidator,),
    )
    city = models.CharField(
        _("city"),
        max_length=50,
        validators=(CityValidator, MinLengthValidator(3)),
    )
    post_code = models.CharField(
        _("post code"), max_length=6, validators=(PostcodeValidator,)
    )
    country = models.ForeignKey(
        "Country",
        on_delete=models.PROTECT,
        related_name="addresses",
        verbose_name=_("country"),
    )

    class Meta:
        verbose_name = _("address")
        verbose_name_plural = _("addresses")

    def __str__(self):
        country_name = self.country.name if self.country else ""
        address = f"ul. {self.street} {self.house_number}"

        if self.apartment_number:
            address += f"/{self.apartment_number}"
        address += f", {self.post_code} {self.city}, {country_name}"
        return address
