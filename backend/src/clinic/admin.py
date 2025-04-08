from django.contrib import admin
from django.contrib.auth.models import Group

from clinic.auth.admin import UserAdminConfig
from clinic.auth.models import User
from clinic.dictionaries.admin import (
    CountryAdminConfig,
    DiseaseAdminConfig,
    MedicineAdminConfig,
    OfficeAdminConfig,
    SpecializationAdminConfig,
)
from clinic.dictionaries.models import (
    Country,
    Disease,
    Medicine,
    Office,
    Specialization,
)
from clinic.filters import CountryAdminFilter
from clinic.models import Address
from clinic.roles.admin import (
    DoctorAdminConfig,
    NurseAdminConfig,
    PatientAdminConfig,
)
from clinic.roles.models import Doctor, Nurse, Patient
from clinic.treatment.admin import PrescriptionAdminConfig, VisitAdminConfig
from clinic.treatment.models import Prescription, Visit


class AddressAdminConfig(admin.ModelAdmin):
    model = Address
    search_fields = (
        "street",
        "city",
        "post_code",
    )
    list_filter = search_fields + (CountryAdminFilter,)
    ordering = search_fields
    list_display = (
        "id",
        "street",
        "city",
        "post_code",
        "house_number",
        "apartment_number",
        "country",
    )

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "street",
                    "city",
                    "house_number",
                    "apartment_number",
                    "post_code",
                    "country",
                )
            },
        ),
    )


admin.site.unregister(Group)
admin.site.register(User, UserAdminConfig)
admin.site.register(Address, AddressAdminConfig)
admin.site.register(Doctor, DoctorAdminConfig)
admin.site.register(Nurse, NurseAdminConfig)
admin.site.register(Patient, PatientAdminConfig)
admin.site.register(Country, CountryAdminConfig)
admin.site.register(Disease, DiseaseAdminConfig)
admin.site.register(Medicine, MedicineAdminConfig)
admin.site.register(Office, OfficeAdminConfig)
admin.site.register(Specialization, SpecializationAdminConfig)
admin.site.register(Prescription, PrescriptionAdminConfig)
admin.site.register(Visit, VisitAdminConfig)
