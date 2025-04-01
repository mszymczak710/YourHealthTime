from django.contrib.admin import SimpleListFilter
from django.utils.translation import gettext_lazy as _

from clinic.dictionaries.models import (
    Country,
    Ingredient,
    Medicine,
    MedicineForm,
    MedicineType,
    OfficeType,
    Specialization,
)


class ActiveIngredientAdminFilter(SimpleListFilter):
    title = "active ingredient"  # Nazwa widoczna w panelu administracyjnym nad opcjami filtrowania.
    parameter_name = "active_ingredient"  # Parametr zapytania w URL-u.

    def lookups(self, request, model_admin):
        """
        Zwraca listę krotek (id, nazwa) dostępnych opcji filtrowania.
        Pierwszy element to wartość kodowana (widoczna w URL-u),
        drugi to czytelna nazwa widoczna w panelu bocznym.
        """
        ingredients = Ingredient.objects.filter(
            medicine_ingredients__isnull=False
        ).distinct()
        return tuple(
            (ingredient.id, ingredient.name) for ingredient in ingredients
        )

    def queryset(self, request, queryset):
        """
        Zwraca przefiltrowany queryset na podstawie wybranej wartości z paska filtrowania.
        """
        if self.value():
            return queryset.filter(active_ingredients__id=self.value())


class CountryAdminFilter(SimpleListFilter):
    title = _("country")
    parameter_name = "country"

    def lookups(self, request, model_admin):
        """
        Zwraca krotki (id, nazwa) krajów do wyboru w pasku filtrowania.
        """
        types = Country.objects.all()
        return tuple((type_.id, type_.name) for type_ in types)

    def queryset(self, request, queryset):
        """
        Filtrowanie querysetu na podstawie wybranego kraju.
        """
        if self.value():
            return queryset.filter(country__id=self.value())
        return queryset


class MedicineFormAdminFilter(SimpleListFilter):
    title = _("form")
    parameter_name = "form"

    def lookups(self, request, model_admin):
        """
        Zwraca możliwe postacie leków jako (id, nazwa).
        """
        forms = MedicineForm.objects.all()
        return tuple((form.id, form.name) for form in forms)

    def queryset(self, request, queryset):
        """
        Filtrowanie po postaci leku.
        """
        if self.value():
            return queryset.filter(form__id=self.value())
        return queryset


class MedicineTypeAdminFilter(SimpleListFilter):
    title = _("type of medicine")
    parameter_name = "type_of_medicine"

    def lookups(self, request, model_admin):
        """
        Zwraca dostępne typy leków jako (id, nazwa).
        """
        types = MedicineType.objects.all()
        return tuple((type_.id, type_.name) for type_ in types)

    def queryset(self, request, queryset):
        """
        Filtrowanie po typie leku.
        """
        if self.value():
            return queryset.filter(type_of_medicine__id=self.value())
        return queryset


class MedicineAdminFilter(SimpleListFilter):
    title = _("medicine")  # Nazwa widoczna w panelu administracyjnym.
    parameter_name = "medicine"  # Parametr w URL-u.

    def lookups(self, request, model_admin):
        """
        Zwraca listę leków, które występują na receptach (unikalne).
        """
        medicines = Medicine.objects.filter(
            prescriptions__isnull=False
        ).distinct()
        return tuple((medicine.id, medicine.name) for medicine in medicines)

    def queryset(self, request, queryset):
        """
        Filtrowanie po leku (przez relację z receptą).
        """
        if self.value():
            return queryset.filter(medicines__id=self.value())


class OfficeTypeAdminFilter(SimpleListFilter):
    title = _("office type")
    parameter_name = "office_type"

    def lookups(self, request, model_admin):
        """
        Zwraca listę typów gabinetów jako (id, nazwa).
        """
        types = OfficeType.objects.all()
        return tuple((type_.id, type_.name) for type_ in types)

    def queryset(self, request, queryset):
        """
        Filtrowanie po typie gabinetu.
        """
        if self.value():
            return queryset.filter(office_type__id=self.value())
        return queryset


class SpecializationAdminFilter(SimpleListFilter):
    title = _("specialization")
    parameter_name = "specialization"

    def lookups(self, request, model_admin):
        """
        Zwraca dostępne specjalizacje jako (id, nazwa).
        """
        specializations = Specialization.objects.all()
        return tuple((spec.id, spec.name) for spec in specializations)

    def queryset(self, request, queryset):
        """
        Filtrowanie po specjalizacji (np. lekarza).
        """
        if self.value():
            return queryset.filter(specializations__id=self.value())
