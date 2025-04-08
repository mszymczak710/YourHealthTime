import pytest


@pytest.fixture
def doctor_patch_data(specialization_instances):
    return {
        "specializations": [spec.id for spec in specialization_instances],
    }


@pytest.fixture
def patient_patch_data(country_instances):
    return {
        "phone_number": "+48727516980",
        "address": {
            "street": "Szosa Lubicka",
            "house_number": "21A",
            "apartment_number": "15",
            "city": "Toruń",
            "post_code": "87-100",
            "country": str(country_instances[1].pk),
        },
    }
