from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import OrderingFilter

from clinic.auth.choices import Role
from clinic.pagination import StandardResultsSetPagination
from clinic.permissions import IsAdmin, IsDoctor, IsNurse, IsPatient
from clinic.roles.filters import (
    DoctorFilterSet,
    NurseFilterSet,
    PatientFilterSet,
)
from clinic.roles.models import Doctor, Nurse, Patient
from clinic.roles.querysets import (
    get_doctor_queryset,
    get_nurse_queryset,
    get_patient_queryset,
)
from clinic.roles.serializers import (
    DoctorReadSerializer,
    DoctorWriteSerializer,
    NurseSerializer,
    PatientDetailSerializer,
    PatientListSerializer,
    PatientWriteSerializer,
)
from clinic.throttling import DoctorRateThrottle, PatientRateThrottle


@extend_schema(
    methods=("patch",),
    request=DoctorWriteSerializer,
    responses={200: DoctorReadSerializer},
)
class DoctorViewSet(viewsets.ModelViewSet):
    permission_classes = (IsNurse | IsDoctor | IsAdmin,)
    queryset = Doctor.objects.all()
    filter_backends = (DjangoFilterBackend, OrderingFilter)
    filterset_class = DoctorFilterSet
    ordering = ("readable_id",)
    ordering_fields = (
        "user__first_name",
        "user__last_name",
        "user__email",
        "job_execution_number",
        "readable_id",
    )
    pagination_class = StandardResultsSetPagination
    http_method_names = ("get", "patch", "delete", "head", "options")

    def get_serializer_class(self):
        if self.action in ("list", "retrieve"):
            return DoctorReadSerializer
        elif self.action == "partial_update":
            return DoctorWriteSerializer

    def get_permissions(self):
        if self.action == "partial_update":
            self.permission_classes = (IsDoctor | IsAdmin,)
        elif self.action == "destroy":
            self.permission_classes = (IsAdmin,)
        return super().get_permissions()

    def get_throttles(self):
        if self.action == "partial_update":
            self.throttle_classes = (DoctorRateThrottle,)
        return super().get_throttles()

    def get_queryset(self):
        return get_doctor_queryset(self.request.user)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.role == Role.DOCTOR and request.user != instance.user:
            raise PermissionDenied
        return super().partial_update(request, *args, **kwargs)


class NurseViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NurseSerializer
    permission_classes = (IsNurse | IsDoctor | IsAdmin,)
    queryset = Nurse.objects.all()
    filter_backends = (DjangoFilterBackend, OrderingFilter)
    filterset_class = NurseFilterSet
    ordering = ("readable_id",)
    ordering_fields = (
        "nursing_license_number",
        "user__first_name",
        "user__last_name",
        "user__email",
        "readable_id",
    )
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return get_nurse_queryset(self.request.user)


@extend_schema(
    methods=("patch",),
    request=PatientWriteSerializer,
    responses={200: PatientDetailSerializer},
)
class PatientViewSet(viewsets.ModelViewSet):
    permission_classes = (IsPatient | IsNurse | IsDoctor | IsAdmin,)
    queryset = Patient.objects.all()
    filter_backends = (DjangoFilterBackend, OrderingFilter)
    filterset_class = PatientFilterSet
    ordering = ("readable_id",)
    ordering_fields = (
        "user__first_name",
        "user__last_name",
        "user__email",
        "pesel",
        "readable_id",
    )
    pagination_class = StandardResultsSetPagination
    http_method_names = ("get", "patch", "head", "options")

    def get_serializer_class(self):
        if self.action == "list":
            return PatientListSerializer
        elif self.action == "retrieve":
            return PatientDetailSerializer
        elif self.action == "partial_update":
            return PatientWriteSerializer

    def get_permissions(self):
        if self.action == "list":
            self.permission_classes = (IsNurse | IsDoctor | IsAdmin,)
        elif self.action == "partial_update":
            self.permission_classes = (IsPatient | IsAdmin,)
        return super().get_permissions()

    def get_queryset(self):
        return get_patient_queryset(self.request.user)

    def get_throttles(self):
        if self.action == "partial_update":
            self.throttle_classes = (PatientRateThrottle,)
        return super().get_throttles()

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if (
            instance.user.role == Role.PATIENT
            and instance.user != request.user
        ):
            raise PermissionDenied
        return super().partial_update(request, *args, **kwargs)
