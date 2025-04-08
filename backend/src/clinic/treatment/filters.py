from django.db.models import Value
from django.db.models.functions import Concat
from django_filters import rest_framework as filters

from clinic.treatment.choices import VisitStatus
from clinic.treatment.models import Prescription, Visit


class BaseTreatmentFilterSet(filters.FilterSet):
    patient__user__first_name = filters.CharFilter(lookup_expr="icontains")
    patient__user__last_name = filters.CharFilter(lookup_expr="icontains")
    patient__user__full_name = filters.CharFilter(
        method="filter_by_patient_full_name"
    )
    patient__pesel = filters.CharFilter(lookup_expr="icontains")
    doctor__user__first_name = filters.CharFilter(lookup_expr="icontains")
    doctor__user__last_name = filters.CharFilter(lookup_expr="icontains")
    doctor__user__full_name = filters.CharFilter(
        method="filter_by_doctor_full_name"
    )
    doctor__job_execution_number = filters.CharFilter(lookup_expr="icontains")
    readable_id = filters.NumberFilter()

    class Meta:
        fields = (
            "patient__user__first_name",
            "patient__user__last_name",
            "patient__pesel",
            "doctor__user__first_name",
            "doctor__user__full_name",
            "doctor__job_execution_number",
            "readable_id",
        )

    def filter_by_patient_full_name(self, queryset, name, value):
        return queryset.annotate(
            patient_full_name=Concat(
                "patient__user__first_name",
                Value(" "),
                "patient__user__last_name",
            )
        ).filter(patient_full_name__icontains=value)

    def filter_by_doctor_full_name(self, queryset, name, value):
        return queryset.annotate(
            doctor_full_name=Concat(
                "doctor__user__first_name",
                Value(" "),
                "doctor__user__last_name",
            )
        ).filter(doctor_full_name__icontains=value)


class VisitFilter(BaseTreatmentFilterSet):
    date = filters.DateTimeFromToRangeFilter()
    duration_in_minutes = filters.RangeFilter()
    visit_status = filters.ChoiceFilter(choices=VisitStatus.choices)
    office__office_type__name = filters.CharFilter(lookup_expr="icontains")
    office__floor = filters.RangeFilter()
    office__room_number = filters.RangeFilter()
    is_remote = filters.BooleanFilter()
    disease__name = filters.CharFilter(lookup_expr="icontains")
    created_at = filters.DateTimeFromToRangeFilter()

    class Meta:
        model = Visit
        fields = BaseTreatmentFilterSet.Meta.fields + (
            "date",
            "duration_in_minutes",
            "visit_status",
            "office__office_type__name",
            "office__floor",
            "office__room_number",
            "is_remote",
            "disease__name",
            "created_at",
        )


class PrescriptionFilter(BaseTreatmentFilterSet):
    issue_date = filters.DateFromToRangeFilter()
    expiry_date = filters.DateFromToRangeFilter()
    medicine = filters.CharFilter(
        field_name="dosages__medicine__name", lookup_expr="icontains"
    )
    visit = filters.ModelChoiceFilter(
        queryset=Visit.objects.all(),
        field_name="visit",
        to_field_name="id",
    )
    prescription_code = filters.CharFilter(lookup_expr="icontains")
    description = filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = Prescription
        fields = BaseTreatmentFilterSet.Meta.fields + (
            "issue_date",
            "expiry_date",
            "medicine",
            "visit",
            "prescription_code",
            "description",
        )
