from clinic.auth.choices import Role
from clinic.treatment.models import Prescription, Visit


def get_visit_queryset(user):
    if user.role in (Role.ADMIN, Role.NURSE):
        return Visit.objects.all()
    elif user.role == Role.DOCTOR:
        return Visit.objects.filter(doctor__user=user)
    elif user.role == Role.PATIENT:
        return Visit.objects.filter(patient__user=user)
    return Visit.objects.none()


def get_prescription_queryset(user):
    if user.role in (Role.ADMIN, Role.DOCTOR):
        return Prescription.objects.all()
    elif user.role == Role.PATIENT:
        return Prescription.objects.filter(patient__user=user)
    return Prescription.objects.none()
