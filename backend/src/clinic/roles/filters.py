from django.db.models import Value
from django.db.models.functions import Concat
from django_filters import rest_framework as filters

from clinic.roles.choices import Gender
from clinic.roles.models import Doctor, Nurse, Patient


class BaseUserFilterSet(filters.FilterSet):
    user__first_name = filters.CharFilter(lookup_expr="icontains")
    user__last_name = filters.CharFilter(lookup_expr="icontains")
    user__email = filters.CharFilter(lookup_expr="icontains")
    readable_id = filters.NumberFilter()
    user__full_name = filters.CharFilter(method="filter_by_full_name")

    class Meta:
        fields = (
            "user__first_name",
            "user__last_name",
            "user__email",
            "readable_id",
        )

    def filter_by_full_name(self, queryset, name, value):
        return queryset.annotate(
            full_name=Concat(
                "user__first_name",
                Value(" "),
                "user__last_name",
            )
        ).filter(full_name__icontains=value)


class DoctorFilterSet(BaseUserFilterSet):
    job_execution_number = filters.CharFilter(lookup_expr="icontains")
    specializations__name = filters.CharFilter(
        method="filter_by_specializations_name"
    )

    readable_id = filters.NumberFilter()

    class Meta:
        model = Doctor
        fields = BaseUserFilterSet.Meta.fields + (
            "job_execution_number",
            "specializations__name",
        )

    def filter_by_specializations_name(self, queryset, name, value):
        """
        Filters doctors based on the names of specializations.
        """
        names = value.split(",")
        return queryset.filter(specializations__name__in=names).distinct()


class NurseFilterSet(BaseUserFilterSet):
    nursing_license_number = filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = Nurse
        fields = BaseUserFilterSet.Meta.fields + ("nursing_license_number",)


class PatientFilterSet(BaseUserFilterSet):
    pesel = filters.CharFilter(lookup_expr="icontains")
    birth_date = filters.DateFromToRangeFilter()
    gender = filters.ChoiceFilter(choices=Gender.choices)

    class Meta:
        model = Patient
        fields = BaseUserFilterSet.Meta.fields + (
            "pesel",
            "birth_date",
            "gender",
        )
