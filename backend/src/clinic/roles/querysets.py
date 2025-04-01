from clinic.auth.choices import Role
from clinic.roles.models import Doctor, Nurse, Patient


def get_doctor_queryset(user):
    if user.role in (Role.DOCTOR, Role.ADMIN, Role.NURSE):
        return Doctor.objects.all()

    return Doctor.objects.none()


def get_nurse_queryset(user):
    if user.role in (Role.ADMIN, Role.DOCTOR):
        return Nurse.objects.all()
    elif user.role == Role.NURSE:
        return Nurse.objects.filter(user=user)
    return Nurse.objects.none()


def get_patient_queryset(user):
    if user.role in (Role.ADMIN, Role.DOCTOR, Role.NURSE):
        return Patient.objects.all()

    return Patient.objects.filter(user=user)
