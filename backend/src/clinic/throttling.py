from rest_framework.throttling import UserRateThrottle


class DoctorRateThrottle(UserRateThrottle):
    scope = "doctor"


class NurseRateThrottle(UserRateThrottle):
    scope = "nurse"


class PatientRateThrottle(UserRateThrottle):
    scope = "patient"
