import uuid

import pytest
from django.contrib.auth import get_user_model
from django.db import connections
from rest_framework.test import APIClient

from clinic.auth.choices import Role
from clinic.dictionaries.models import (
    Country,
    Disease,
    Ingredient,
    Medicine,
    MedicineForm,
    MedicineIngredient,
    MedicineType,
    Office,
    OfficeType,
    Specialization,
)
from clinic.models import Address
from clinic.roles.models import Doctor, Nurse, Patient


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def random_uuid():
    return uuid.uuid4()


SEQUENCES = (
    "clinic_user_readable_id_seq",
    "clinic_doctor_readable_id_seq",
    "clinic_nurse_readable_id_seq",
    "clinic_patient_readable_id_seq",
    "clinic_country_readable_id_seq",
    "clinic_disease_readable_id_seq",
    "clinic_ingredient_readable_id_seq",
    "clinic_medicine_readable_id_seq",
    "clinic_office_readable_id_seq",
    "clinic_specialization_readable_id_seq",
    "clinic_prescription_readable_id_seq",
    "clinic_visit_readable_id_seq",
)


@pytest.fixture(autouse=True)
def create_sequences(django_db_setup, django_db_blocker):
    with django_db_blocker.unblock():
        with connections["default"].cursor() as cursor:
            for seq in SEQUENCES:
                cursor.execute(
                    f"CREATE SEQUENCE IF NOT EXISTS {seq} "
                    "START WITH 1 INCREMENT BY 1;"
                )


@pytest.fixture
def user_factory(db):
    def create_user(role, email=None, **kwargs):
        user_model = get_user_model()
        role_label = Role.labels[Role.values.index(role)]

        if email is None:
            email = f"{role_label.lower()}@example.com"

        return user_model.objects.create_user(
            email=email,
            password="testpassword",
            first_name=kwargs.get("first_name", "Test"),
            last_name=kwargs.get("last_name", role_label),
            role=role,
            **kwargs,
        )

    return create_user


@pytest.fixture
def country_factory(db):
    def create_country(code, name):
        country, _ = Country.objects.get_or_create(
            code=code, defaults={"name": name}
        )
        return country

    return create_country


@pytest.fixture
def country_instances(
    country_factory,
):
    country_data = (
        ("PL", "Polska"),
        ("DE", "Niemcy"),
        ("FR", "Francja"),
    )
    return tuple(country_factory(*data) for data in country_data)


@pytest.fixture
def address_factory(db, country_instances):
    def create_address(
        street,
        house_number,
        apartment_number,
        city,
        post_code,
        country=country_instances[0],
    ):
        return Address.objects.create(
            street=street,
            house_number=house_number,
            city=city,
            post_code=post_code,
            apartment_number=apartment_number,
            country=country,
        )

    return create_address


@pytest.fixture
def address_instances(address_factory):
    address_data = (
        ("Ulica", "1", "1A", "Miasto", "00-000"),
        ("Inna Ulica", "2", None, "Inne Miasto", "11-111"),
    )
    return tuple(address_factory(*data) for data in address_data)


@pytest.fixture
def specialization_factory(db):
    def create_specialization(name):
        specialization, _ = Specialization.objects.get_or_create(name=name)
        return specialization

    return create_specialization


@pytest.fixture
def specialization_instances(specialization_factory):
    names = ("Kardiologia", "Neurologia", "Diabetologia")
    return tuple(specialization_factory(name) for name in names)


@pytest.fixture
def nurses(user_factory):
    return tuple(
        user_factory(role=Role.NURSE, email=f"pielegniarka{i}@example.com")
        for i in range(1, 4)
    )


@pytest.fixture
def admin_instances(user_factory):
    return tuple(
        user_factory(
            role=Role.ADMIN,
            email=f"admin{i}@example.com",
            is_staff=True,
            is_superuser=True,
        )
        for i in range(1, 3)
    )


@pytest.fixture
def nurse_instances(nurses, db):
    nurse_objects = tuple(
        Nurse(user=nurse, nursing_license_number=f"{1234567 + i}")
        for i, nurse in enumerate(nurses, start=1)
    )
    Nurse.objects.bulk_create(nurse_objects)
    return nurse_objects


@pytest.fixture
def authenticated_nurse(api_client, nurse_instances):
    user = nurse_instances[0].user
    api_client.force_authenticate(user=user)
    api_client.user = user
    return (api_client, nurse_instances[0])


@pytest.fixture
def doctors(user_factory):
    return tuple(
        user_factory(role=Role.DOCTOR, email=f"lekarz{i}@example.com")
        for i in range(1, 4)
    )


@pytest.fixture
def doctor_instances(doctors, specialization_instances, db):
    doctor_objects = tuple(
        Doctor(user=doctor, job_execution_number=f"{1000040 + i}")
        for i, doctor in enumerate(doctors, start=1)
    )
    Doctor.objects.bulk_create(doctor_objects)

    doctor_objects = list(Doctor.objects.filter(user__in=doctors))
    for i, doctor in enumerate(doctor_objects):
        doctor.specializations.add(
            specialization_instances[i % len(specialization_instances)]
        )

    return doctor_objects


@pytest.fixture
def authenticated_doctor(api_client, doctor_instances):
    user = doctor_instances[0].user
    api_client.force_authenticate(user=user)
    api_client.user = user
    return (api_client, doctor_instances[0])


@pytest.fixture
def patients(user_factory):
    return tuple(
        user_factory(role=Role.PATIENT, email=f"pacjent{i}@example.com")
        for i in range(1, 6)
    )


@pytest.fixture
def patient_instances(patients, address_instances, db):
    patient_objects = []
    for i, patient in enumerate(patients, start=1):
        patient = Patient(
            user=patient,
            pesel=f"9{i}0{i}11123{i}4",
            phone_number=f"+4855412365{i}",
            address=address_instances[i % len(address_instances)],
        )
        patient.save()
        patient_objects.append(patient)
    return patient_objects


@pytest.fixture
def authenticated_patient(api_client, patient_instances):
    user = patient_instances[0].user
    api_client.force_authenticate(user=user)
    api_client.user = user
    return (api_client, patient_instances[0])


@pytest.fixture
def disease_instances(db):
    disease_names = ("Depresja", "Grypa", "Angina")
    diseases = tuple(Disease(name=name) for name in disease_names)
    return Disease.objects.bulk_create(diseases)


@pytest.fixture
def ingredient_instances(db):
    ingredient_names = (
        "Lewotyroksyna sodowa",
        "Ibuprofen",
        "Kwas acetylosalicylowy",
    )
    ingredients = tuple(Ingredient(name=name) for name in ingredient_names)
    return Ingredient.objects.bulk_create(ingredients)


@pytest.fixture
def medicine_factory(db, ingredient_instances):
    def create_medicine(
        name, medicine_type_name, medicine_form_name, ingredient_details
    ):
        type_of_medicine, _ = MedicineType.objects.get_or_create(
            name=medicine_type_name
        )
        form, _ = MedicineForm.objects.get_or_create(name=medicine_form_name)

        medicine = Medicine.objects.create(
            name=name,
            type_of_medicine=type_of_medicine,
            form=form,
        )

        for ingredient_index, quantity, unit in ingredient_details:
            MedicineIngredient.objects.create(
                medicine=medicine,
                ingredient=ingredient_instances[ingredient_index],
                quantity=quantity,
                unit=unit,
            )

        return medicine

    return create_medicine


@pytest.fixture
def medicine_instances(medicine_factory):
    return (
        medicine_factory(
            "Euthyrox",
            "Lek na niedoczynność tarczycy",
            "Tabletka",
            [(0, 100, "mcg")],
        ),
        medicine_factory(
            "Ibuprofen",
            "Lek przeciwzapalny niesteroidowy",
            "Tabletka",
            [(1, 200, "mg")],
        ),
        medicine_factory(
            "Ibuprofen Kids",
            "Lek przeciwzapalny niesteroidowy",
            "Syrop",
            [(1, 100, "mg/ml")],
        ),
        medicine_factory(
            "Aspiryna",
            "Lek przeciwbólowy, przeciwgorączkowy, przeciwzapalny",
            "Tabletka",
            [(2, 300, "mg")],
        ),
    )


@pytest.fixture
def office_factory(db):
    def create_office(office_type_name, floor, room_number):
        office_type, _ = OfficeType.objects.get_or_create(
            name=office_type_name
        )
        office = Office.objects.create(
            office_type=office_type, floor=floor, room_number=room_number
        )
        return office

    return create_office


@pytest.fixture
def office_instances(office_factory):
    return (
        office_factory("Gabinet medycyny rodzinnej", 1, 101),
        office_factory("Stomatologiczny", 1, 102),
        office_factory("Pediatryczny", 2, 103),
        office_factory("Gabinet medycyny rodzinnej", 0, 104),
        office_factory("Endokrynologiczny", 1, 105),
        office_factory("Kardiologiczny", 2, 106),
    )
