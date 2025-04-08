from django_filters import rest_framework as filters

from clinic.dictionaries.models import (
    Country,
    Disease,
    Medicine,
    Office,
    Specialization,
)


class BaseDictionaryFilterSet(filters.FilterSet):
    id_exclude = filters.CharFilter(field_name="id", exclude=True)
    name = filters.CharFilter(lookup_expr="icontains")
    readable_id = filters.NumberFilter()

    class Meta:
        abstract = True


class CountryFilterSet(BaseDictionaryFilterSet):
    code = filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = Country
        fields = ("code", "name", "readable_id")


class DiseaseFilterSet(BaseDictionaryFilterSet):
    class Meta:
        model = Disease
        fields = ("name", "readable_id")


class MedicineFilterSet(BaseDictionaryFilterSet):
    type_of_medicine__name = filters.CharFilter(lookup_expr="icontains")
    form__name = filters.CharFilter(lookup_expr="icontains")
    active_ingredients__name = filters.CharFilter(
        method="filter_by_active_ingredient"
    )

    class Meta:
        model = Medicine
        fields = (
            "name",
            "type_of_medicine__name",
            "form__name",
            "active_ingredients__name",
            "readable_id",
        )

    def filter_by_active_ingredient(self, queryset, name, value):
        """
        Filters drugs based on the name of the active ingredient.
        """
        ingredient_names = value.split(",")
        return queryset.filter(
            medicine_ingredients__ingredient__name__in=ingredient_names
        ).distinct()


class OfficeFilterSet(filters.FilterSet):
    id_exclude = filters.CharFilter(field_name="id", exclude=True)
    office_type__name = filters.CharFilter(lookup_expr="icontains")
    floor = filters.RangeFilter()
    readable_id = filters.NumberFilter()
    room_number = filters.RangeFilter()

    class Meta:
        model = Office
        fields = ("office_type__name", "floor", "readable_id", "room_number")


class SpecializationFilterSet(BaseDictionaryFilterSet):
    class Meta:
        model = Specialization
        fields = ("name", "readable_id")
