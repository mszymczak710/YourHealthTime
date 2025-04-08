import random
from datetime import datetime, timedelta, timezone

from django.db import models
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import ValidationError

from clinic.models import BaseModel
from clinic.treatment.choices import VisitStatus
from clinic.validators import PrescriptionCodeValidator


class Visit(BaseModel):
    date = models.DateTimeField(_("visit date"))
    duration_in_minutes = models.IntegerField(_("duration [min]"))
    visit_status = models.CharField(
        _("visit status"),
        max_length=1,
        choices=VisitStatus.choices,
        default=VisitStatus.SCHEDULED,
    )
    patient = models.ForeignKey(
        "Patient",
        on_delete=models.PROTECT,
        related_name="visits",
        verbose_name=_("patient"),
    )
    doctor = models.ForeignKey(
        "Doctor",
        on_delete=models.PROTECT,
        related_name="visits",
        verbose_name=_("doctor"),
    )
    office = models.ForeignKey(
        "Office",
        on_delete=models.PROTECT,
        related_name="visits",
        verbose_name=_("office"),
    )
    is_remote = models.BooleanField(_("is remote"), default=False)
    notes = models.TextField(_("notes"), blank=True, null=True, max_length=500)
    disease = models.ForeignKey(
        "Disease",
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        related_name="visits",
        verbose_name=_("disease"),
    )
    predicted_end_date = models.DateTimeField(_("predicted end date"))
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)

    def save(self, *args, **kwargs):
        self.predicted_end_date = self.date + timedelta(
            minutes=self.duration_in_minutes
        )

        current_time = datetime.now(timezone.utc)
        if self.date > current_time:
            self.visit_status = VisitStatus.SCHEDULED
        elif self.predicted_end_date > current_time:
            self.visit_status = VisitStatus.IN_PROGRESS
        else:
            self.visit_status = VisitStatus.COMPLETED

        super().save(*args, **kwargs)

    def refresh_visit_status_based_on_time(self) -> bool:
        """
        Odświeża status wizyty na podstawie aktualnego czasu.
        Zwraca True, jeśli status uległ zmianie.
        """
        now = datetime.now(timezone.utc)

        if self.date > now:
            new_status = VisitStatus.SCHEDULED
        elif self.predicted_end_date > now:
            new_status = VisitStatus.IN_PROGRESS
        else:
            new_status = VisitStatus.COMPLETED

        if self.visit_status != new_status:
            self.visit_status = new_status
            return True

        return False

    def __str__(self):
        patient_str = f"Patient: {self.patient}"
        doctor_str = f"Doctor: {self.doctor}"
        date_str = self.date.strftime("%d.%m.%Y, %I:%M")
        return f"Visit ({date_str}) - {patient_str}, {doctor_str}"

    class Meta:
        verbose_name = _("visit")
        verbose_name_plural = _("visits")


class Prescription(BaseModel):
    prescription_code = models.CharField(
        _("prescription code"),
        max_length=4,
        validators=(PrescriptionCodeValidator,),
        blank=True,
        unique=True,
    )
    issue_date = models.DateField(_("issue date"), auto_now_add=True)
    expiry_date = models.DateField(_("expiry date"), null=True)
    medicines = models.ManyToManyField(
        "Medicine",
        through="Dosage",
        related_name="prescriptions",
        verbose_name=_("medicines"),
    )
    description = models.TextField(_("description"), max_length=500)
    visit = models.ForeignKey(
        "Visit",
        on_delete=models.PROTECT,
        related_name="prescriptions",
        verbose_name=_("visit"),
        blank=True,
        null=True,
    )
    patient = models.ForeignKey(
        "Patient",
        on_delete=models.PROTECT,
        related_name="prescriptions",
        verbose_name=_("patient"),
        blank=True,
        null=True,
    )
    doctor = models.ForeignKey(
        "Doctor",
        on_delete=models.PROTECT,
        related_name="prescriptions",
        verbose_name=_("doctor"),
        blank=True,
        null=True,
    )

    def generate_unique_prescription_code(self) -> str:
        for i in range(10):
            code = f"{random.randint(0, 9999):04d}"
            if not Prescription.objects.filter(
                prescription_code=code
            ).exists():
                return code
        raise ValidationError(
            _("Nie udało się wygenerować unikalnego kodu recepty.")
        )

    def save(self, *args, **kwargs):
        if not self.issue_date:
            self.issue_date = datetime.now(timezone.utc).date()

        if not self.prescription_code:
            self.prescription_code = self.generate_unique_prescription_code()

        self.expiry_date = self.issue_date + timedelta(days=30)
        super().save(*args, **kwargs)

    def __str__(self):
        patient_str = f"Patient: {self.patient}"
        doctor_str = f"Doctor: {self.doctor}"
        issue_date_str = self.issue_date.strftime("%d.%m.%Y")
        expiry_date_str = self.expiry_date.strftime("%d.%m.%Y")
        return f"Prescription ({issue_date_str} - {expiry_date_str}) - {patient_str}, {doctor_str}"

    class Meta:
        verbose_name = _("prescription")
        verbose_name_plural = _("prescriptions")


class Dosage(models.Model):
    medicine = models.ForeignKey(
        "Medicine",
        on_delete=models.CASCADE,
        related_name="dosages",
        verbose_name=_("medicine"),
    )
    prescription = models.ForeignKey(
        "Prescription",
        on_delete=models.CASCADE,
        related_name="dosages",
        verbose_name=_("prescription"),
    )
    amount = models.DecimalField(_("amount"), max_digits=5, decimal_places=2)
    frequency = models.CharField(_("frequency"), max_length=100)

    class Meta:
        verbose_name = _("dosage")
        verbose_name_plural = _("dosages")

    def __str__(self):
        return f"{self.medicine.name} - {self.amount} {self.medicine.form} ({self.frequency})"
