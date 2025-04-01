from django.utils.translation import gettext_lazy as _

from clinic.filters import SpecializationAdminFilter
from clinic.mixins import FullnameAdminMixin


class DoctorAdminConfig(FullnameAdminMixin):
    list_display = (
        "id",
        "readable_id",
        "user_first_name",
        "user_last_name",
        "job_execution_number",
        "get_specializations",
    )
    list_filter = (SpecializationAdminFilter,)
    list_per_page = 10
    search_fields = (
        "job_execution_number",
        "user__first_name",
        "user__last_name",
    )
    ordering = ("readable_id",)

    def get_specializations(self, obj):
        return ", ".join(s.name for s in obj.specializations.all())

    get_specializations.short_description = _("specializations")

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "user",
                    "job_execution_number",
                    "specializations",
                ),
            },
        ),
    )

    def delete_model(self, request, obj):
        obj.delete()

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj.delete()


class NurseAdminConfig(FullnameAdminMixin):
    list_display = (
        "id",
        "readable_id",
        "user_first_name",
        "user_last_name",
        "nursing_license_number",
    )
    list_per_page = 10
    search_fields = (
        "nursing_license_number",
        "user__first_name",
        "user__last_name",
    )
    ordering = ("readable_id",)

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "user",
                    "nursing_license_number",
                ),
            },
        ),
    )

    def delete_model(self, request, obj):
        obj.delete()

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj.delete()


class PatientAdminConfig(FullnameAdminMixin):
    list_display = (
        "id",
        "readable_id",
        "user_first_name",
        "user_last_name",
        "gender",
        "birth_date",
        "phone_number",
        "address",
    )
    list_per_page = 10
    search_fields = ("pesel", "user__first_name", "user__last_name")
    ordering = ("readable_id",)

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "user",
                    "pesel",
                    "phone_number",
                    "address",
                ),
            },
        ),
    )

    def delete_model(self, request, obj):
        obj.delete()

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            obj.delete()
