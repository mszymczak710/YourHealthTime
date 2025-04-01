import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.exceptions import ErrorDetail


@pytest.mark.django_db
@pytest.mark.parametrize("url_name", (("doctor-list"), ("doctor-detail")))
def test_unauthenticated_user_cannot_list_or_retrieve_doctors(
    api_client, doctor_instances, url_name
):
    doctor = doctor_instances[0]
    url = reverse(url_name, args=(doctor.pk,) if "detail" in url_name else ())
    response = api_client.get(url)

    expected_error = ErrorDetail(
        string="Nie podano danych uwierzytelniających.",
        code="not_authenticated",
    )
    expected_response = {"detail": expected_error}

    assert (response.status_code, response.data) == (
        status.HTTP_401_UNAUTHORIZED,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "filter_param, filter_value, expected_count",
    (
        ("job_execution_number", "1000043", 1),
        ("user__email", "lekarz1@example.com", 1),
        ("user__first_name", "Testowa", 0),
        ("user__last_name", "Doctor", 3),
        ("user__full_name", "Test D", 3),
    ),
)
def test_filter_doctor(
    authenticated_doctor,
    filter_param,
    filter_value,
    expected_count,
    doctor_instances,
):
    api_client, _ = authenticated_doctor
    url = reverse("doctor-list")
    ordering = "readable_id"
    response = api_client.get(
        f"{url}?{filter_param}={filter_value}&ordering={ordering}"
    )

    assert (response.status_code, len(response.data)) == (
        status.HTTP_200_OK,
        expected_count,
    )


@pytest.mark.parametrize(
    "filter_values, expected_count",
    [
        (["Neurologia"], 1),
        (["Neurologia", "Kardiologia"], 2),
    ],
)
@pytest.mark.django_db
def test_filter_doctor_by_multiple_specializations(
    authenticated_doctor, filter_values, expected_count, doctor_instances
):
    api_client, _ = authenticated_doctor
    url = reverse("doctor-list")
    ordering = "readable_id"
    filter_param = "specializations__name"
    filter_value = ",".join(filter_values)
    response = api_client.get(
        f"{url}?{filter_param}={filter_value}&ordering={ordering}"
    )

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == expected_count


@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture, url_name",
    (
        ("authenticated_patient", "doctor-list"),
        ("authenticated_patient", "doctor-detail"),
    ),
)
def test_patient_cannot_list_or_retrieve_doctors(
    api_client, user_fixture, url_name, doctor_instances, request
):
    api_client, _ = request.getfixturevalue(user_fixture)
    doctor = doctor_instances[0]
    url = reverse(url_name, args=(doctor.pk,) if "detail" in url_name else ())
    response = api_client.get(url)

    expected_error = ErrorDetail(
        string="Nie masz uprawnień, by wykonać tę czynność.",
        code="permission_denied",
    )
    expected_response = {"detail": expected_error}

    assert (response.status_code, response.data) == (
        status.HTTP_403_FORBIDDEN,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture", ("authenticated_doctor", "authenticated_nurse")
)
def test_doctor_or_nurse_can_list_doctors(
    api_client, user_fixture, doctor_instances, request
):
    url = reverse("doctor-list")
    api_client, _ = request.getfixturevalue(user_fixture)
    ordering = "readable_id"
    response = api_client.get(f"{url}?ordering={ordering}")

    assert (response.status_code, len(response.data)) == (
        status.HTTP_200_OK,
        len(doctor_instances),
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture", ("authenticated_doctor", "authenticated_nurse")
)
def test_doctor_or_nurse_cannot_retrieve_details_of_nonexistent_doctor(
    api_client, user_fixture, random_uuid, request
):
    api_client, _ = request.getfixturevalue(user_fixture)
    url = reverse("doctor-detail", args=(str(random_uuid),))
    response = api_client.get(url)

    expected_error = ErrorDetail("Nie znaleziono.", code="not_found")
    expected_response = {"detail": expected_error}

    assert (response.status_code, response.data) == (
        status.HTTP_404_NOT_FOUND,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture", ("authenticated_doctor", "authenticated_nurse")
)
def test_doctor_or_nurse_can_retrieve_doctor_details(
    api_client, user_fixture, doctor_instances, request
):
    doctor = doctor_instances[0]
    api_client, _ = request.getfixturevalue(user_fixture)
    url = reverse("doctor-detail", args=(doctor.pk,))
    response = api_client.get(url)
    specializations = [
        specialization["name"]
        for specialization in response.data["specializations"]
    ]

    assert (
        response.status_code,
        response.data["user"]["first_name"],
        response.data["user"]["last_name"],
        response.data["user"]["email"],
        specializations,
        response.data["job_execution_number"],
    ) == (
        status.HTTP_200_OK,
        "Test",
        "Doctor",
        "lekarz1@example.com",
        ["Kardiologia"],
        "1000041",
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture", ("authenticated_doctor", "authenticated_nurse")
)
def test_unsupported_http_methods_are_rejected_for_doctor_detail(
    request, doctor_instances, user_fixture
):
    api_client, _ = request.getfixturevalue(user_fixture)
    doctor = doctor_instances[0]
    url = reverse("doctor-detail", args=(doctor.pk,))

    response = api_client.put(url)
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@pytest.mark.django_db
def test_nurse_cannot_delete_doctor(authenticated_nurse, doctor_instances):
    api_client, _ = authenticated_nurse
    doctor = doctor_instances[0]
    url = reverse("doctor-detail", args=(doctor.pk,))

    response = api_client.delete(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture", ("authenticated_doctor", "authenticated_nurse")
)
def test_post_method_not_supported_for_doctors_list(request, user_fixture):
    api_client, _ = request.getfixturevalue(user_fixture)
    url = reverse("doctor-list")
    doctor_data = {
        "user": {
            "email": "nowy_lekarz@example.com",
            "password": "testpassword",
            "first_name": "Nowy",
            "last_name": "Lekarz",
            "role": "D",
        },
        "job_execution_number": "1000048",
        "specializations": ["Testowa specjalizacja"],
    }

    response = api_client.post(url, doctor_data, format="json")
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@pytest.mark.django_db
def test_doctor_can_edit_own_data(authenticated_doctor, doctor_patch_data):
    api_client, doctor = authenticated_doctor
    url = reverse("doctor-detail", args=(doctor.pk,))

    response = api_client.patch(url, data=doctor_patch_data, format="json")

    doctor.refresh_from_db()

    specializations = [
        specialization["name"]
        for specialization in response.data["specializations"]
    ]

    assert (response.status_code, specializations) == (
        status.HTTP_200_OK,
        ["Kardiologia", "Neurologia", "Diabetologia"],
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "patch_data, content_type, format, expected_status, expected_response",
    (
        (
            "this is not valid json",
            "application/json",
            None,
            status.HTTP_400_BAD_REQUEST,
            {
                "detail": "JSON parse error - Expecting value: line 1 column 1 (char 0)"
            },
        ),
        (
            {
                "specializations": [],
            },
            None,
            "json",
            status.HTTP_400_BAD_REQUEST,
            {
                "specializations": [
                    ErrorDetail(
                        string="Lista nie może być pusta.", code="empty"
                    )
                ],
            },
        ),
        (
            "specializations=['Nowa specjalizacja']",
            "application/x-www-form-urlencoded",
            None,
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            {
                "detail": ErrorDetail(
                    string='Brak wsparcia dla żądanego typu danych "application/x-www-form-urlencoded".',
                    code="unsupported_media_type",
                )
            },
        ),
    ),
)
def test_doctor_cannot_edit_own_data_with_invalid_input_format(
    authenticated_doctor,
    patch_data,
    content_type,
    format,
    expected_status,
    expected_response,
):
    api_client, doctor = authenticated_doctor
    url = reverse("doctor-detail", args=(doctor.pk,))

    if not format:
        response = api_client.patch(url, patch_data, content_type=content_type)

    if not content_type:
        response = api_client.patch(url, patch_data, format=format)

    assert (response.status_code, response.data) == (
        expected_status,
        expected_response,
    )


@pytest.mark.django_db
def test_doctor_cannot_edit_read_only_fields(authenticated_doctor):
    api_client, doctor = authenticated_doctor
    url = reverse("doctor-detail", args=(doctor.pk,))

    original_job_execution_number = doctor.job_execution_number
    original_user_email = doctor.user.email
    original_user_first_name = doctor.user.first_name
    original_user_last_name = doctor.user.last_name
    original_user_role = doctor.user.role

    patch_data = {
        "user": {
            "email": "edytowany_lekarz@example.com",
            "first_name": "Edytowany",
            "last_name": "Lekarz",
            "role": "D",
        },
        "job_execution_number": "100051",
    }

    response = api_client.patch(url, patch_data, format="json")

    doctor.refresh_from_db()
    assert (
        response.status_code,
        original_job_execution_number,
        original_user_email,
        original_user_first_name,
        original_user_last_name,
        original_user_role,
    ) == (
        status.HTTP_200_OK,
        doctor.job_execution_number,
        doctor.user.email,
        doctor.user.first_name,
        doctor.user.last_name,
        doctor.user.role,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture", ("authenticated_doctor", "authenticated_nurse")
)
def test_doctor_or_nurse_cannot_edit_other_doctor_data(
    doctor_instances, doctor_patch_data, request, user_fixture
):
    api_client, _ = request.getfixturevalue(user_fixture)
    doctor = doctor_instances[0]
    other_doctor = doctor_instances[1]

    if user_fixture == "authenticated_doctor":
        url = reverse("doctor-detail", args=(other_doctor.pk,))
    else:
        url = reverse("doctor-detail", args=(doctor.pk,))

    response = api_client.patch(url, data=doctor_patch_data, format="json")

    expected_error = ErrorDetail(
        string="Nie masz uprawnień, by wykonać tę czynność.",
        code="permission_denied",
    )
    expected_response = {"detail": expected_error}

    assert (response.status_code, response.data) == (
        status.HTTP_403_FORBIDDEN,
        expected_response,
    )


@pytest.mark.django_db
def test_doctor_cannot_set_nonexistent_specialization(
    authenticated_doctor, random_uuid
):
    api_client, doctor = authenticated_doctor
    url = reverse("doctor-detail", args=(doctor.pk,))

    non_existent_specialization_id = random_uuid

    patch_data = {"specializations": [non_existent_specialization_id]}

    response = api_client.patch(url, patch_data, format="json")

    expected_error = ErrorDetail(
        string=f'Błędny klucz główny "{non_existent_specialization_id}" - obiekt nie istnieje.',
        code="does_not_exist",
    )
    expected_response = {"specializations": [expected_error]}

    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_response,
    )


@pytest.mark.django_db
def test_edit_nonexistent_doctor(
    authenticated_doctor, doctor_patch_data, random_uuid
):
    api_client, _ = authenticated_doctor
    url = reverse("doctor-detail", args=(str(random_uuid),))

    response = api_client.patch(url, data=doctor_patch_data, format="json")

    expected_error = ErrorDetail("Nie znaleziono.", code="not_found")
    expected_response = {"detail": expected_error}

    assert (response.status_code, response.data) == (
        status.HTTP_404_NOT_FOUND,
        expected_response,
    )
