import pytest
from rest_framework import status
from rest_framework.exceptions import ErrorDetail

LOGIN_URL = "/auth/login/"


@pytest.mark.django_db
@pytest.mark.parametrize(
    "instances, expected_email, expected_role, is_admin",
    [
        ("patient_instances", "pacjent1@example.com", "P", False),
        ("doctor_instances", "lekarz1@example.com", "D", False),
        ("nurse_instances", "pielegniarka1@example.com", "N", False),
        ("admin_instances", "admin1@example.com", "A", True),
    ],
)
def test_login_successful(
    api_client, request, instances, expected_email, expected_role, is_admin
):
    instance_list = request.getfixturevalue(instances)
    instance = instance_list[0]

    login_data = {
        "email": instance.email if is_admin else instance.user.email,
        "password": "testpassword",
    }

    response = api_client.post(
        LOGIN_URL,
        data=login_data,
        format="json",
    )

    assert (
        response.status_code,
        "access" in response.data["tokens"],
        "refresh" in response.data["tokens"],
        response.data["user"]["email"],
        response.data["user"]["first_name"],
        response.data["user"]["last_name"],
        response.data["user"]["role"],
        response.data["user"]["profile_id"],
    ) == (
        status.HTTP_200_OK,
        True,
        True,
        expected_email,
        "Test",
        "User",
        expected_role,
        instance.id,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "input_data, expected_status, expected_response",
    (
        (
            {"email": "", "password": "testpassword"},
            status.HTTP_400_BAD_REQUEST,
            {},
        ),
        (
            {"email": "test@example.com", "password": ""},
            status.HTTP_400_BAD_REQUEST,
            {},
        ),
        ({"email": "", "password": ""}, status.HTTP_400_BAD_REQUEST, {}),
        (
            {"email": "test@example.com", "password": "wrongpassword"},
            status.HTTP_400_BAD_REQUEST,
            {
                "non_field_errors": [
                    ErrorDetail(
                        string="Niepoprawny adres e-mail lub hasło.",
                        code="invalid",
                    )
                ]
            },
        ),
        ({}, status.HTTP_400_BAD_REQUEST, {}),
    ),
)
def test_login_invalid_input_format(
    api_client, user, input_data, expected_status, expected_response
):
    if "email" in input_data and input_data["email"] == "test@example.com":
        input_data["email"] = user.email

    response = api_client.post(LOGIN_URL, data=input_data, format="json")

    if expected_response:
        assert (response.status_code, response.data) == (
            expected_status,
            expected_response,
        )
    else:
        assert response.status_code == expected_status


@pytest.mark.django_db
def test_login_nonexistent_user(api_client, user):
    user.email = "nonexistent@example.com"

    login_data = {"email": user.email, "password": "testpassword"}

    response = api_client.post(
        LOGIN_URL,
        data=login_data,
        format="json",
    )

    expected_error = [
        ErrorDetail(
            string="Niepoprawny adres e-mail lub hasło.", code="invalid"
        )
    ]
    expected_response = {"non_field_errors": expected_error}

    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture, expected_detail",
    (
        (
            "user_not_confirmed",
            ErrorDetail(
                string="Użytkownik nie jest aktywny.", code="permission_denied"
            ),
        ),
        (
            "inactive_user",
            ErrorDetail(
                string="Użytkownik nie jest aktywny.", code="permission_denied"
            ),
        ),
    ),
)
def test_login_user_status(api_client, request, user_fixture, expected_detail):
    user = request.getfixturevalue(user_fixture)
    login_data = {"email": user.email, "password": "testpassword"}
    response = api_client.post(
        LOGIN_URL,
        data=login_data,
        format="json",
    )

    expected_response = {"non_field_errors": expected_detail}
    assert (response.status_code, response.data) == (
        status.HTTP_403_FORBIDDEN,
        expected_response,
    )


@pytest.mark.django_db
def test_multiple_login(api_client, user):
    for _ in range(5):
        response = api_client.post(
            LOGIN_URL,
            data={"email": user.email, "password": "testpassword"},
            format="json",
        )

    expected_error = ErrorDetail(
        string="Użytkownik jest już zalogowany.", code="invalid"
    )
    expected_response = {"non_field_errors": [expected_error]}

    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize("http_method", ("get", "patch", "delete", "put"))
def test_login_user_http_methods_not_allowed(api_client, http_method):
    method = getattr(api_client, http_method)
    response = method(LOGIN_URL)
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@pytest.mark.django_db
@pytest.mark.parametrize(
    "login_data, content_type, expected_status, expected_response",
    (
        (
            "email=test@example.com&password=testpassword",
            "application/x-www-form-urlencoded",
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            {
                "detail": ErrorDetail(
                    string='Brak wsparcia dla żądanego typu danych "application/x-www-form-urlencoded".',
                    code="unsupported_media_type",
                )
            },
        ),
        (
            "this is not valid json",
            "application/json",
            status.HTTP_400_BAD_REQUEST,
            {
                "detail": "JSON parse error - Expecting value: line 1 column 1 (char 0)"
            },
        ),
    ),
)
def test_login_with_invalid_data_format(
    api_client, login_data, content_type, expected_status, expected_response
):
    response = api_client.post(
        LOGIN_URL,
        data=login_data,
        content_type=content_type,
    )

    assert (response.status_code, response.data) == (
        expected_status,
        expected_response,
    )
