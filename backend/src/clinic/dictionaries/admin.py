from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from clinic.dictionaries.models import (
    Country,
    Disease,
    Medicine,
    MedicineIngredient,
    Office,
    Specialization,
)
from clinic.filters import (
    ActiveIngredientAdminFilter,
    MedicineFormAdminFilter,
    MedicineTypeAdminFilter,
    OfficeTypeAdminFilter,
)


class CountryAdminConfig(admin.ModelAdmin):
    model = Country
    list_display = ("id", "readable_id", "name", "code")
    list_per_page = 10
    search_fields = ("name", "code")
    ordering = list_display


class DiseaseAdminConfig(admin.ModelAdmin):
    model = Disease
    list_display = (
        "id",
        "readable_id",
        "name",
    )
    list_per_page = 10
    search_fields = ("name",)
    ordering = list_display


class MedicineIngredientInline(admin.TabularInline):
    model = MedicineIngredient
    verbose_name = _("active ingredient")
    extra = 1


class MedicineAdminConfig(admin.ModelAdmin):
    model = Medicine
    inlines = (MedicineIngredientInline,)
    list_display = (
        "id",
        "readable_id",
        "name",
        "type_of_medicine",
        "get_active_ingredients",
        "form",
    )
    list_filter = (
        MedicineTypeAdminFilter,
        MedicineFormAdminFilter,
        ActiveIngredientAdminFilter,
    )
    list_per_page = 10
    search_fields = (
        "name",
        "type_of_medicine__name",
        "active_ingredients__name",
    )
    ordering = (
        "readable_id",
        "name",
    )

    def get_active_ingredients(self, obj):
        """Concatenate all active ingredients with quantity and unit into a comma-separated string."""
        return ", ".join(
            f"{medicine_ingredient.ingredient.name} ({medicine_ingredient.quantity} {medicine_ingredient.unit})"
            for medicine_ingredient in MedicineIngredient.objects.filter(
                medicine=obj
            )
        )

    get_active_ingredients.short_description = _("Active ingredients")

    fieldsets = (
        (
            _("Medicine"),
            {
                "fields": (
                    "name",
                    "type_of_medicine",
                    "form",
                )
            },
        ),
    )


class OfficeAdminConfig(admin.ModelAdmin):
    model = Office
    list_display = (
        "id",
        "readable_id",
        "office_type",
        "floor",
        "room_number",
    )

    list_filter = (OfficeTypeAdminFilter, "floor", "room_number")
    search_fields = ("office_type__name",)
    ordering = (
        "readable_id",
        "floor",
        "room_number",
    )

    fieldsets = (
        (
            None,
            {"fields": ("office_type", "floor", "room_number")},
        ),
    )


class SpecializationAdminConfig(admin.ModelAdmin):
    model = Specialization
    list_display = (
        "id",
        "readable_id",
        "name",
    )
    list_per_page = 10
    search_fields = ("name",)
    ordering = list_display
