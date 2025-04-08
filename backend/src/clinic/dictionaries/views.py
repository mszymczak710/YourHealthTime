from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import AllowAny

from clinic.dictionaries.filters import (
    CountryFilterSet,
    DiseaseFilterSet,
    MedicineFilterSet,
    OfficeFilterSet,
    SpecializationFilterSet,
)
from clinic.dictionaries.models import (
    Country,
    Disease,
    Medicine,
    Office,
    Specialization,
)
from clinic.dictionaries.serializers import (
    CountrySerializer,
    DiseaseSerializer,
    MedicineSerializer,
    OfficeSerializer,
    SpecializationSerializer,
)
from clinic.pagination import StandardResultsSetPagination
from clinic.permissions import IsAdmin, IsDoctor, IsNurse, IsPatient


class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    filterset_class = CountryFilterSet
    filter_backends = (DjangoFilterBackend, OrderingFilter)
    ordering = ("readable_id",)
    ordering_fields = ("code", "name", "readable_id")
    permission_classes = (AllowAny,)
    pagination_class = StandardResultsSetPagination


class DiseaseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Disease.objects.all()
    filter_backends = (DjangoFilterBackend, OrderingFilter)
    filterset_class = DiseaseFilterSet
    ordering = ("readable_id",)
    ordering_fields = ("name", "readable_id")
    serializer_class = DiseaseSerializer
    permission_classes = (IsDoctor | IsNurse | IsAdmin,)
    pagination_class = StandardResultsSetPagination


class MedicineViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Medicine.objects.all()
    filter_backends = (DjangoFilterBackend, OrderingFilter)
    filterset_class = MedicineFilterSet
    ordering = ("readable_id",)
    ordering_fields = (
        "name",
        "type_of_medicine__name",
        "form__name",
        "readable_id",
    )
    serializer_class = MedicineSerializer
    permission_classes = (IsDoctor | IsAdmin,)
    pagination_class = StandardResultsSetPagination


class OfficeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Office.objects.all()
    filter_backends = (DjangoFilterBackend, OrderingFilter)
    filterset_class = OfficeFilterSet
    ordering = ("readable_id",)
    ordering_fields = (
        "office_type__name",
        "floor",
        "readable_id",
        "room_number",
    )
    serializer_class = OfficeSerializer
    permission_classes = (IsPatient | IsNurse | IsDoctor | IsAdmin,)
    pagination_class = StandardResultsSetPagination


class SpecializationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Specialization.objects.all()
    filter_backends = (DjangoFilterBackend, OrderingFilter)
    filterset_class = SpecializationFilterSet
    ordering = ("readable_id",)
    ordering_fields = ("name", "readable_id")
    serializer_class = SpecializationSerializer
    permission_classes = (IsDoctor | IsAdmin,)
    pagination_class = StandardResultsSetPagination
