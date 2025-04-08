from datetime import datetime, timedelta, timezone

from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from clinic.dictionaries.serializers import (
    DiseaseSerializer,
    MedicineFormSerializer,
    MedicineNoFormSerializer,
    OfficeSerializer,
)
from clinic.roles.serializers import (
    DoctorReadSerializer,
    PatientListSerializer,
)
from clinic.treatment.choices import VisitStatus
from clinic.treatment.models import Dosage, Prescription, Visit


class VisitReadSerializer(serializers.ModelSerializer):
    doctor = DoctorReadSerializer()
    patient = PatientListSerializer()
    disease = DiseaseSerializer()
    office = OfficeSerializer()

    class Meta:
        model = Visit
        fields = "__all__"


class VisitWriteSerializer(serializers.ModelSerializer):
    def validate_duration_in_minutes(self, value):
        if not (5 <= value <= 180):
            raise serializers.ValidationError(
                _("Czas trwania wizyty musi wynosić od 5 do 180 minut.")
            )
        return value

    def validate(self, data):
        current_time = datetime.now(timezone.utc)

        # Walidacja uniemożliwiająca modyfikację wizyty będącej w trakcie lub zakończonej
        if self.instance and self.instance.visit_status in [
            VisitStatus.IN_PROGRESS,
            VisitStatus.COMPLETED,
        ]:
            raise serializers.ValidationError(
                {
                    "non_field_errors": _(
                        "Nie można modyfikować wizyty, która jest w trakcie lub została zakończona."
                    )
                }
            )

        # Walidacja blokująca edycję wizyty na mniej niż 24 godziny przed rozpoczęciem
        if self.instance:
            time_before_appointment = timedelta(hours=24)
            if self.instance.date - current_time <= time_before_appointment:
                raise serializers.ValidationError(
                    {
                        "non_field_errors": _(
                            "Nie można modyfikować wizyty w ciągu 24 godzin przed jej planowanym rozpoczęciem."
                        )
                    }
                )

        # Walidacja kolidujących wizyt
        start_time = data.get("date")
        if not start_time:
            raise serializers.ValidationError(
                {
                    "non_field_errors": _(
                        "Nieprawidłowy format daty początkowej."
                    )
                }
            )

        if start_time < current_time:
            raise serializers.ValidationError(
                {
                    "non_field_errors": _(
                        "Data i godzina wizyty muszą być w przyszłości."
                    )
                }
            )

        end_time = start_time + timedelta(
            minutes=data.get("duration_in_minutes")
        )
        overlapping_visits = Visit.objects.filter(
            date__lt=end_time, predicted_end_date__gt=start_time
        ).exclude(pk=self.instance.pk if self.instance else None)

        # Sprawdzenie kolidujących wizyt dla lekarza, gabinetu i pacjenta
        if overlapping_visits.filter(doctor=data.get("doctor")).exists():
            raise serializers.ValidationError(
                {"non_field_errors": _("Lekarz ma nakładającą się wizytę.")}
            )

        if overlapping_visits.filter(office=data.get("office")).exists():
            raise serializers.ValidationError(
                {
                    "non_field_errors": _(
                        "Gabinet nie jest dostępny w wybranym czasie."
                    )
                }
            )

        if overlapping_visits.filter(patient=data.get("patient")).exists():
            raise serializers.ValidationError(
                {"non_field_errors": _("Pacjent ma nakładającą się wizytę.")}
            )

        return super().validate(data)

    def to_representation(self, instance):
        serializer = VisitReadSerializer(instance)
        return serializer.data

    class Meta:
        model = Visit
        fields = "__all__"
        read_only_fields = (
            "id",
            "readable_id",
            "predicted_end_date",
            "created_at",
            "visit_status",
        )


class DosageReadSerializer(serializers.ModelSerializer):
    medicine = MedicineNoFormSerializer()

    class Meta:
        model = Dosage
        fields = ("medicine", "amount", "frequency")

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Założenie: instancja modelu Medicine zawiera atrybut `form`
        # Dodanie zserializowanej formy leku za pomocą MedicineFormSerializer
        form_representation = MedicineFormSerializer(
            instance.medicine.form
        ).data
        representation["form"] = form_representation
        return representation


class DosageWriteSerializer(serializers.ModelSerializer):
    def validate_amount(self, value):
        if value <= 0 or value > 100:
            raise serializers.ValidationError(
                _(
                    "Nieprawidłowa ilość. Musi być dodatnia i nie może przekraczać 100."
                )
            )
        return value

    class Meta:
        model = Dosage
        fields = ("medicine", "amount", "frequency")


class PrescriptionReadSerializer(serializers.ModelSerializer):
    doctor = DoctorReadSerializer()
    patient = PatientListSerializer()
    dosages = DosageReadSerializer(many=True)

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Jeśli recepta powiązana z wizytą – nadpisanie danych pacjenta i lekarza danymi z wizyty
        if instance.visit:
            from clinic.roles.serializers import (
                DoctorReadSerializer,
                PatientListSerializer,
            )

            data["patient"] = PatientListSerializer(
                instance.visit.patient
            ).data
            data["doctor"] = DoctorReadSerializer(instance.visit.doctor).data

        return data

    class Meta:
        model = Prescription
        fields = (
            "id",
            "patient",
            "doctor",
            "dosages",
            "readable_id",
            "prescription_code",
            "issue_date",
            "expiry_date",
            "description",
            "visit",
        )


class PrescriptionWriteSerializer(serializers.ModelSerializer):
    dosages = DosageWriteSerializer(many=True)

    def validate(self, data):
        visit = data.get("visit")
        patient = data.get("patient")
        doctor = data.get("doctor")

        # Jeśli podano wizytę
        if visit:
            if patient or doctor:
                raise serializers.ValidationError(
                    {
                        "non_field_errors": _(
                            "Nie można podać pacjenta ani lekarza, gdy podano wizytę."
                        )
                    }
                )

            # Ustawienie pacjenta i lekarza na podstawie wizyty
            data["patient"] = visit.patient
            data["doctor"] = visit.doctor

        # Jeśli nie podano wizyty – wymagane podanie zarówno pacjenta, jak i lekarza
        elif not patient or not doctor:
            raise serializers.ValidationError(
                {
                    "non_field_errors": _(
                        "Należy podać albo wizytę, albo zarówno pacjenta, jak i lekarza."
                    )
                }
            )

        return data

    def create(self, validated_data):
        dosages_data = validated_data.pop("dosages")
        prescription = Prescription.objects.create(**validated_data)
        for dosage_data in dosages_data:
            Dosage.objects.create(prescription=prescription, **dosage_data)

        return prescription

    def to_representation(self, instance):
        serializer = PrescriptionReadSerializer(instance)
        return serializer.data

    class Meta:
        model = Prescription
        fields = "__all__"
        read_only_fields = (
            "id",
            "readable_id",
            "issue_date",
            "expiry_date",
            "prescription_code",
        )
