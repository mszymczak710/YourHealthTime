from datetime import datetime, timedelta, timezone

import pytest
import pytz

from clinic.treatment.models import Dosage, Prescription, Visit


@pytest.fixture
def visit_factory(db, doctor_instances, patient_instances, office_instances):
    def create_visit(
        date,
        duration_in_minutes,
        doctor,
        patient,
        office,
        disease=None,
        is_remote=False,
        notes="",
    ):
        visit = Visit.objects.create(
            date=date,
            duration_in_minutes=duration_in_minutes,
            doctor=doctor,
            patient=patient,
            office=office,
            disease=disease,
            is_remote=is_remote,
            notes=notes,
        )
        return visit

    return create_visit


@pytest.fixture
def visit_instances(
    visit_factory,
    disease_instances,
    doctor_instances,
    patient_instances,
    office_instances,
):
    date_visit_0 = datetime(2025, 12, 1, 10, 0, tzinfo=pytz.UTC)
    date_visit_1 = datetime(2023, 12, 9, 11, 0, tzinfo=pytz.UTC)
    date_visit_2 = datetime.now(timezone.utc)
    date_visit_3 = datetime(2023, 12, 1, 15, 45, tzinfo=pytz.UTC)
    date_visit_4 = datetime.now(timezone.utc) + timedelta(hours=23)
    visits = []

    visits.append(
        visit_factory(
            date=date_visit_0,
            duration_in_minutes=20,
            doctor=doctor_instances[0],
            patient=patient_instances[0],
            office=office_instances[0],
            disease=disease_instances[0],
            notes="Visit 1",
        )
    )

    visits.append(
        visit_factory(
            date=date_visit_1,
            duration_in_minutes=35,
            doctor=doctor_instances[0],
            patient=patient_instances[1],
            office=office_instances[1],
        )
    )

    visits.append(
        visit_factory(
            date=date_visit_2,
            duration_in_minutes=40,
            doctor=doctor_instances[1],
            patient=patient_instances[0],
            office=office_instances[3],
        )
    )

    visits.append(
        visit_factory(
            date=date_visit_3,
            duration_in_minutes=30,
            doctor=doctor_instances[2],
            patient=patient_instances[1],
            office=office_instances[2],
            is_remote=True,
            notes="Visit 4",
        )
    )

    visits.append(
        visit_factory(
            date=date_visit_4,
            duration_in_minutes=50,
            doctor=doctor_instances[2],
            patient=patient_instances[2],
            office=office_instances[4],
        )
    )

    return visits


@pytest.fixture
def visit_data(
    doctor_instances, patient_instances, office_instances, disease_instances
):
    date = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
    return {
        "date": date,
        "duration_in_minutes": 30,
        "doctor": doctor_instances[0].pk,
        "patient": patient_instances[0].pk,
        "office": office_instances[0].pk,
        "disease": disease_instances[0].pk,
    }


@pytest.fixture
def prescription_factory(
    db,
    visit_instances,
    doctor_instances,
    patient_instances,
    medicine_instances,
):
    def create_prescription_and_dosages(
        code, doctor=None, patient=None, visit=None, description="", dosages=[]
    ):
        if visit:
            patient = visit.patient if not patient else patient
            doctor = visit.doctor if not doctor else doctor

        prescription = Prescription.objects.create(
            prescription_code=code,
            doctor=doctor,
            patient=patient,
            visit=visit,
            description=description,
        )
        for dosage_info in dosages:
            medicine, amount, frequency = dosage_info
            Dosage.objects.create(
                prescription=prescription,
                medicine=medicine,
                amount=amount,
                frequency=frequency,
            )
        return prescription

    return create_prescription_and_dosages


@pytest.fixture
def prescription_instances(
    prescription_factory,
    doctor_instances,
    patient_instances,
    visit_instances,
    medicine_instances,
):
    prescriptions = []

    prescriptions.append(
        prescription_factory(
            code="1234",
            doctor=doctor_instances[0],
            patient=patient_instances[0],
            description="Test prescription 1",
            dosages=[(medicine_instances[0], 1.0, "1 raz dziennie")],
        )
    )
    prescriptions.append(
        prescription_factory(
            code="1235",
            doctor=doctor_instances[0],
            patient=patient_instances[2],
            description="Test prescription 2",
            dosages=[(medicine_instances[1], 2.0, "1 raz dziennie")],
        )
    )
    prescriptions.append(
        prescription_factory(
            code="1236",
            doctor=doctor_instances[1],
            patient=patient_instances[0],
            description="Test prescription 3",
            dosages=[(medicine_instances[1], 1.0, "3 razy dziennie")],
        )
    )
    prescriptions.append(
        prescription_factory(
            code="1237",
            visit=visit_instances[3],
            description="Test prescription 4",
            dosages=[(medicine_instances[2], 1.5, "2 razy dziennie")],
        )
    )
    return prescriptions


@pytest.fixture
def prescription_data(doctor_instances, patient_instances, medicine_instances):
    return {
        "doctor": doctor_instances[0].pk,
        "patient": patient_instances[0].pk,
        "description": "Description",
        "dosages": [
            {
                "medicine": medicine_instances[0].pk,
                "amount": 1.5,
                "frequency": "rano",
            }
        ],
    }


@pytest.fixture
def prescription_data_with_visit(visit_instances, medicine_instances):
    return {
        "visit": visit_instances[0].pk,
        "description": "Description",
        "dosages": [
            {
                "medicine": medicine_instances[0].pk,
                "amount": 1.5,
                "frequency": "rano",
            }
        ],
    }
