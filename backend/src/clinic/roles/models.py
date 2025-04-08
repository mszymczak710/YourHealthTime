import datetime

from django.core.validators import MinLengthValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

from clinic.auth.models import User
from clinic.dictionaries.models import Specialization
from clinic.models import Address, BaseModel
from clinic.roles.choices import Gender
from clinic.validators import (
    JobExecutionNumberValidator,
    NursingLicenseNumberValidator,
    PhoneNumberValidator,
    pesel_validator,
)


class Doctor(BaseModel):
    user = models.OneToOneField(
        User,
        on_delete=models.PROTECT,
        related_name="doctor",
        verbose_name=_("user"),
    )
    job_execution_number = models.CharField(
        _("job execution number"),
        max_length=7,
        unique=True,
        validators=(JobExecutionNumberValidator,),
    )
    specializations = models.ManyToManyField(
        Specialization,
        related_name="doctors",
        verbose_name=_("specializations"),
    )

    class Meta:
        verbose_name = _("doctor")
        verbose_name_plural = _("doctors")

    def delete(self, *args, **kwargs):
        user = self.user
        super().delete(*args, **kwargs)
        if user:
            user.delete()

    def __str__(self):
        return f"{self.user.full_name} ({self.job_execution_number})"


class Nurse(BaseModel):
    user = models.OneToOneField(
        User,
        on_delete=models.PROTECT,
        related_name="nurse",
        verbose_name=_("user"),
    )
    nursing_license_number = models.CharField(
        _("nursing license number"),
        max_length=7,
        unique=True,
        validators=(NursingLicenseNumberValidator,),
    )

    class Meta:
        verbose_name = _("nurse")
        verbose_name_plural = _("nurses")

    def delete(self, *args, **kwargs):
        user = self.user
        super().delete(*args, **kwargs)
        if user:
            user.delete()

    def __str__(self):
        return f"{self.user.full_name} ({self.nursing_license_number})"


class Patient(BaseModel):
    user = models.OneToOneField(
        User,
        on_delete=models.PROTECT,
        related_name="patient",
        verbose_name=_("user"),
    )
    pesel = models.CharField(
        _("PESEL"), max_length=11, unique=True, validators=(pesel_validator,)
    )
    phone_number = models.CharField(
        _("phone number"),
        max_length=15,
        validators=(PhoneNumberValidator, MinLengthValidator(7)),
    )
    address = models.ForeignKey(
        Address,
        on_delete=models.PROTECT,
        related_name="patients",
        verbose_name=_("address"),
    )
    doctors = models.ManyToManyField(
        Doctor,
        through="clinic.Visit",
        related_name="patients",
        verbose_name=_("doctors"),
    )
    gender = models.CharField(
        _("gender"),
        max_length=1,
        choices=Gender.choices,
    )
    birth_date = models.DateField(_("birth date"), null=True, blank=True)

    class Meta:
        verbose_name = _("patient")
        verbose_name_plural = _("patients")

    def save(self, *args, **kwargs):
        self.gender = (
            Gender.FEMALE if int(self.pesel[9]) % 2 == 0 else Gender.MALE
        )

        self.birth_date = self._calculate_birth_date()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        user = self.user
        address = (
            self.address
            if self.address and self.address.patients.count() == 1
            else None
        )

        super().delete(*args, **kwargs)

        if user:
            user.delete()

        if address:
            address.delete()

    def _calculate_birth_date(self):
        try:
            year = int(self.pesel[0:2])
            month = int(self.pesel[2:4])
            day = int(self.pesel[4:6])

            if 1 <= month <= 12:
                year += 1900
            elif 21 <= month <= 32:
                year += 2000
                month -= 20
            elif 41 <= month <= 52:
                year += 2100
                month -= 40
            elif 61 <= month <= 72:
                year += 2200
                month -= 60
            elif 81 <= month <= 92:
                year += 1800
                month -= 80
            else:
                return None

            return datetime.date(year, month, day)
        except (ValueError, TypeError):
            return None

    def __str__(self):
        return f"{self.user.full_name} ({self.pesel})"
