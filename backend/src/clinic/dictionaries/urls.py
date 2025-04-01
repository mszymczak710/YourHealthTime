from django.urls import include, path
from rest_framework.routers import SimpleRouter

from clinic.dictionaries.views import (
    CountryViewSet,
    DiseaseViewSet,
    MedicineViewSet,
    OfficeViewSet,
    SpecializationViewSet,
)

router = SimpleRouter()
router.register(r"countries", CountryViewSet, basename="country"),
router.register(r"diseases", DiseaseViewSet, basename="disease")
router.register(r"medicines", MedicineViewSet, basename="medicine")
router.register(r"offices", OfficeViewSet, basename="office")
router.register(
    r"specializations", SpecializationViewSet, basename="specialization"
)

urlpatterns = [
    path("", include(router.urls)),
]
