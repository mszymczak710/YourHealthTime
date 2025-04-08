from django.contrib import admin
from django.db.models import CharField, Q, Value
from django.db.models.functions import Coalesce, Concat
from django.urls import reverse
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _

from clinic.filters import MedicineAdminFilter
from clinic.treatment.models import Dosage, Prescription, Visit


class VisitAdminConfig(admin.ModelAdmin):
    model = Visit
    search_fields = ("doctor__job_execution_number", "patient__pesel")
    list_filter = (
        "visit_status",
        "date",
        "disease",
        "office",
        "is_remote",
    )
    ordering = ("readable_id",)
    list_display = (
        "id",
        "readable_id",
        "patient",
        "doctor",
        "date",
        "predicted_end_date",
        "visit_status",
        "office",
        "is_remote",
        "disease",
        "created_at",
    )

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "patient",
                    "doctor",
                    "date",
                    "duration_in_minutes",
                    "disease",
                    "office",
                    "is_remote",
                    "notes",
                )
            },
        ),
    )

    def get_queryset(self, request):
        """
        Nadpisanie metody get_queryset w celu:
        1. Dodania adnotacji z pełnymi imionami i nazwiskami lekarza oraz pacjenta.
        2. Dynamicznego przeliczenia statusów wizyt na podstawie aktualnego czasu.
        """
        queryset = super().get_queryset(request)
        queryset = queryset.annotate(
            # Konkatenacja imienia i nazwiska lekarza w celu uzyskania pełnego imienia i nazwiska.
            full_name_doctor=Concat(
                "doctor__user__first_name",
                Value(" "),
                "doctor__user__last_name",
                output_field=CharField(),
            ),
            # Analogiczna konkatenacja dla pacjenta.
            full_name_patient=Concat(
                "patient__user__first_name",
                Value(" "),
                "patient__user__last_name",
                output_field=CharField(),
            ),
        )

        # Aktualizacja statusów wizyt w locie, jeśli wymagają zmiany
        to_update = []
        for visit in queryset:
            if visit.refresh_visit_status_based_on_time():
                to_update.append(visit)

        if to_update:
            Visit.objects.bulk_update(to_update, ["visit_status"])

        return queryset

    def get_search_results(self, request, queryset, search_term):
        """
        Nadpisanie metody get_search_results w celu umożliwienia wyszukiwania po pełnym imieniu i nazwisku lekarza oraz pacjenta.

        Rozszerzenie domyślnej funkcjonalności wyszukiwania o możliwość przeszukiwania rekordów wizyt z użyciem pełnych imion i nazwisk lekarzy oraz pacjentów. Ułatwienie nawigacji i wyszukiwania w panelu administracyjnym.
        """
        queryset, use_distinct = super().get_search_results(
            request, queryset, search_term
        )
        if search_term:
            # Rozszerzenie wyszukiwania o pełne imiona i nazwiska lekarzy oraz pacjentów.
            queryset |= self.model.objects.annotate(
                full_name_doctor=Concat(
                    "doctor__user__first_name",
                    Value(" "),
                    "doctor__user__last_name",
                    output_field=CharField(),
                ),
                full_name_patient=Concat(
                    "patient__user__first_name",
                    Value(" "),
                    "patient__user__last_name",
                    output_field=CharField(),
                ),
            ).filter(
                Q(full_name_doctor__icontains=search_term)
                | Q(full_name_patient__icontains=search_term)
            )
        return queryset, use_distinct


class DosageInline(admin.TabularInline):
    model = Dosage
    verbose_name = _("medicine")
    extra = 1


class PrescriptionAdminConfig(admin.ModelAdmin):
    model = Prescription
    inlines = (DosageInline,)
    search_fields = (
        "doctor_job_execution_number",
        "patient_pesel",
    )
    list_filter = ("issue_date", MedicineAdminFilter)
    ordering = ("readable_id",)
    list_display = (
        "id",
        "readable_id",
        "get_patient",
        "get_doctor",
        "issue_date",
        "expiry_date",
        "get_medicines",
        "get_visit",
    )
    fieldsets = (
        (
            _("Prescription information"),
            {
                "fields": (
                    "patient",
                    "doctor",
                    "description",
                    "visit",
                )
            },
        ),
    )

    def get_patient(self, obj):
        if obj.visit:
            return obj.visit.patient
        return obj.patient

    get_patient.short_description = _("Patient")
    get_patient.admin_order_field = "patient_pesel"

    def get_doctor(self, obj):
        if obj.visit:
            return obj.visit.doctor
        return obj.doctor

    get_doctor.short_description = _("Doctor")
    get_doctor.admin_order_field = "doctor_job_execution_number"

    def get_visit(self, obj):
        if obj.visit:
            url = reverse(
                "admin:%s_%s_change"
                % (obj.visit._meta.app_label, obj.visit._meta.model_name),
                args=[obj.visit.pk],
            )
            return format_html('<a href="{}">{}</a>', url, obj.visit)
        return "---"

    get_visit.short_description = _("Visit")

    def get_medicines(self, obj):
        """Złączenie wszystkich leków z dawkowaniem w jeden ciąg znaków oddzielony przecinkami."""
        return ", ".join(
            f"{dosage.medicine.name} - {dosage.amount} {dosage.frequency}"
            for dosage in Dosage.objects.filter(prescription=obj)
        )

    get_medicines.short_description = _("Medicines")

    def get_queryset(self, request):
        """
        Nadpisanie metody get_queryset w celu dodania adnotacji z dodatkowymi polami.

        Rozszerzenie zapytania bazowego o adnotacje zawierające pełne imiona i nazwiska lekarza i pacjenta, numer wykonywania zawodu lekarza oraz numer PESEL pacjenta. Adnotacje te wykorzystywane są w panelu administracyjnym do lepszej prezentacji i sortowania recept.
        """
        queryset = super().get_queryset(request)
        queryset = queryset.annotate(
            # Adnotacja z pełnym imieniem i nazwiskiem lekarza – priorytetowo wykorzystywany lekarz z wizyty, jeśli dostępny.
            full_name_doctor=Concat(
                Coalesce(
                    "doctor__user__first_name",
                    "visit__doctor__user__first_name",
                    Value(""),
                ),
                Value(" "),
                Coalesce(
                    "doctor__user__last_name",
                    "visit__doctor__user__last_name",
                    Value(""),
                ),
                output_field=CharField(),
            ),
            # Adnotacja z numerem wykonywania zawodu lekarza – priorytetowo z wizyty.
            doctor_job_execution_number=Coalesce(
                "doctor__job_execution_number",
                "visit__doctor__job_execution_number",
            ),
            # Adnotacja z pełnym imieniem i nazwiskiem pacjenta – priorytetowo z wizyty.
            full_name_patient=Concat(
                Coalesce(
                    "patient__user__first_name",
                    "visit__patient__user__first_name",
                    Value(""),
                ),
                Value(" "),
                Coalesce(
                    "patient__user__last_name",
                    "visit__patient__user__last_name",
                    Value(""),
                ),
                output_field=CharField(),
            ),
            # Adnotacja z numerem PESEL pacjenta – priorytetowo z wizyty.
            patient_pesel=Coalesce("patient__pesel", "visit__patient__pesel"),
        )
        return queryset

    def get_search_results(self, request, queryset, search_term):
        """
        Nadpisanie metody get_search_results w celu umożliwienia wyszukiwania po numerze wykonywania zawodu lekarza oraz numerze PESEL pacjenta, a także po ich imionach i nazwiskach.

        Rozszerzenie możliwości wyszukiwania w panelu administracyjnym, tak aby umożliwić odnalezienie recept po nazwisku, numerze PESEL pacjenta, imieniu i nazwisku lekarza oraz jego numerze prawa wykonywania zawodu.
        """
        queryset, use_distinct = super().get_search_results(
            request, queryset, search_term
        )
        if search_term:
            queryset |= self.model.objects.annotate(
                doctor_job_execution_number=Coalesce(
                    "doctor__job_execution_number",
                    "visit__doctor__job_execution_number",
                ),
                full_name_doctor=Concat(
                    Coalesce(
                        "doctor__user__first_name",
                        "visit__doctor__user__first_name",
                        Value(""),
                    ),
                    Value(" "),
                    Coalesce(
                        "doctor__user__last_name",
                        "visit__doctor__user__last_name",
                        Value(""),
                    ),
                    output_field=CharField(),
                ),
                patient_pesel=Coalesce(
                    "patient__pesel", "visit__patient__pesel"
                ),
                full_name_patient=Concat(
                    Coalesce(
                        "patient__user__first_name",
                        "visit__patient__user__first_name",
                        Value(""),
                    ),
                    Value(" "),
                    Coalesce(
                        "patient__user__last_name",
                        "visit__patient__user__last_name",
                        Value(""),
                    ),
                    output_field=CharField(),
                ),
            ).filter(
                Q(full_name_doctor__icontains=search_term)
                | Q(doctor_job_execution_number__icontains=search_term)
                | Q(full_name_patient__icontains=search_term)
                | Q(patient_pesel__icontains=search_term)
            )
        return queryset, use_distinct
