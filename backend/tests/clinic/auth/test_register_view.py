import pytest
from rest_framework import status
from rest_framework.exceptions import ErrorDetail

from clinic.auth.models import User

REGISTER_URL = "/auth/register/"


@pytest.mark.django_db
@pytest.mark.parametrize(
    "send_email_called",
    (False, True),
)
def test_register_user_successful(
    api_client,
    mocker,
    user_data,
    send_email_called,
):
    mocker.patch("clinic.auth.serializers.verify_recaptcha", return_value=True)

    if send_email_called:
        mocked_send_email = mocker.patch(
            "clinic.mixins.MailSendingMixin.send_email"
        )

    response = api_client.post(REGISTER_URL, data=user_data, format="json")

    assert response.status_code == status.HTTP_201_CREATED

    if send_email_called:
        mocked_send_email.assert_called_once()


@pytest.mark.django_db
def test_register_user_email_send_failure(api_client, mocker, user_data):
    mocker.patch("clinic.auth.serializers.verify_recaptcha", return_value=True)

    initial_user_count = User.objects.count()

    mocker.patch(
        "clinic.mixins.MailSendingMixin.send_email",
        side_effect=Exception("SMTP server error"),
    )

    response = api_client.post(REGISTER_URL, data=user_data, format="json")

    expected_error = {
        "non_field_errors": ErrorDetail(
            string="Nie udało się wysłać maila weryfikacyjnego. Spróbuj ponownie później.",
            code="invalid",
        )
    }

    assert (response.status_code, response.data, User.objects.count()) == (
        status.HTTP_400_BAD_REQUEST,
        expected_error,
        initial_user_count,
    )


@pytest.mark.django_db
def test_register_user_bad_request(api_client, mocker, user_data):
    user_data.pop("email", None)
    user_data.pop("last_name", None)

    response = api_client.post(REGISTER_URL, data=user_data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_register_user_existing_email(api_client, mocker, user_data):
    mocker.patch("clinic.auth.serializers.verify_recaptcha", return_value=True)
    User.objects.create_user(
        email="existing@example.com",
        password="existingpassword",
        first_name="Jan",
        last_name="Testowy",
    )

    user_data["email"] = "existing@example.com"

    response = api_client.post(REGISTER_URL, data=user_data, format="json")
    expected_error = "Ten adres e-mail jest już używany."
    expected_response = {"email": [expected_error]}

    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "field_name, field_value, patch_return, expected_errors, nested_field",
    (
        (
            "first_name",
            "./Test123./",
            True,
            [
                ErrorDetail(
                    string="Imię musi zaczynać się wielką literą, a następnie zawierać małe litery.",
                    code="invalid_first_name",
                ),
            ],
            None,
        ),
        (
            "last_name",
            "<Test123>",
            True,
            [
                ErrorDetail(
                    string="Nazwisko musi zaczynać się wielką literą, a następnie zawierać małe litery.",
                    code="invalid_last_name",
                ),
            ],
            None,
        ),
        (
            "email",
            "invalidemail",
            True,
            [
                ErrorDetail(
                    string="Podaj poprawny adres e-mail.", code="invalid"
                )
            ],
            None,
        ),
        (
            "role",
            "INVALID_ROLE",
            True,
            [
                ErrorDetail(
                    string='"INVALID_ROLE" nie jest poprawnym wyborem.',
                    code="invalid_choice",
                )
            ],
            None,
        ),
        (
            "recaptcha_response",
            None,
            False,
            ["Nieprawidłowa reCAPTCHA. Spróbuj ponownie."],
            None,
        ),
        (
            "pesel",
            "1234A5B123C",
            True,
            ["Numer PESEL musi składać się z 11 cyfr."],
            None,
        ),
        (
            "pesel",
            "12345678901",
            True,
            ["Nieprawidłowy numer PESEL."],
            None,
        ),
        (
            "phone_number",
            "+48.1234.567",
            True,
            [
                ErrorDetail(
                    string="Nieprawidłowy format numeru telefonu. Wprowadź poprawny numer telefonu.",
                    code="invalid_phone_number",
                )
            ],
            None,
        ),
        (
            "address",
            "Testowa6",
            True,
            [
                ErrorDetail(
                    string="Nazwa miasta musi zaczynać się wielką literą i zawierać wyłącznie litery, spacje i myślniki.",
                    code="invalid_city",
                )
            ],
            "city",
        ),
        (
            "address",
            "Testowa6",
            True,
            [
                ErrorDetail(
                    string="Nazwa ulicy musi zaczynać się wielką literą i zawierać wyłącznie litery, spacje i myślniki.",
                    code="invalid_street",
                )
            ],
            "street",
        ),
        (
            "address",
            "871-00",
            True,
            [
                ErrorDetail(
                    string="Nieprawidłowy format kodu pocztowego. Wprowadź poprawny kod w formacie XX-XXX.",
                    code="invalid_post_code",
                )
            ],
            "post_code",
        ),
        (
            "address",
            "Neverland",
            True,
            [
                ErrorDetail(
                    string="Wartość „Neverland” nie jest poprawnym UUID-em.",
                    code="invalid",
                )
            ],
            "country",
        ),
        (
            "address",
            "15AA",
            True,
            [
                ErrorDetail(
                    string="Numer domu musi zaczynać się od cyfry innej niż zero, opcjonalnie może zawierać do dwóch dodatkowych cyfr i kończyć się pojedynczą literą.",
                    code="invalid_house_number",
                )
            ],
            "house_number",
        ),
        (
            "address",
            "1A",
            True,
            [
                ErrorDetail(
                    string="Numer mieszkania musi być liczbą z zakresu od 1 do 999.",
                    code="invalid_apartment_number",
                )
            ],
            "apartment_number",
        ),
    ),
)
def test_register_user_invalid_fields(
    api_client,
    mocker,
    user_data,
    field_name,
    field_value,
    patch_return,
    expected_errors,
    nested_field,
):
    if nested_field:
        user_data[field_name][nested_field] = field_value
    elif field_value is not None:
        user_data[field_name] = field_value

    mocker.patch(
        "clinic.auth.serializers.verify_recaptcha", return_value=patch_return
    )

    response = api_client.post(REGISTER_URL, data=user_data, format="json")

    if nested_field:
        expected_response = {field_name: {nested_field: expected_errors}}
    else:
        expected_response = {field_name: expected_errors}

    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "password, password_confirm, expected_response",
    (
        (
            "short",
            "short",
            {
                "password": [
                    ErrorDetail(
                        string="To hasło jest za krótkie. Musi zawierać co najmniej 8 znaków.",
                        code="password_too_short",
                    ),
                    ErrorDetail(
                        string="Upewnij się, że pole ma co najmniej 8 znaków.",
                        code="min_length",
                    ),
                ],
                "password_confirm": [
                    ErrorDetail(
                        string="Upewnij się, że pole ma co najmniej 8 znaków.",
                        code="min_length",
                    )
                ],
            },
        ),
        (
            "password123",
            "password123",
            {
                "password": [
                    ErrorDetail(
                        string="To hasło jest zbyt powszechne.",
                        code="password_too_common",
                    )
                ]
            },
        ),
        (
            "validpassword123",
            "differentpassword123",
            {"password_confirm": ["Hasła muszą być identyczne."]},
        ),
    ),
)
def test_register_user_password_validation(
    api_client,
    mocker,
    user_data,
    password,
    password_confirm,
    expected_response,
):
    user_data["password"] = password
    user_data["password_confirm"] = password_confirm
    mocker.patch("clinic.auth.serializers.verify_recaptcha", return_value=True)

    response = api_client.post(REGISTER_URL, data=user_data, format="json")

    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "missing_fields, expected_response",
    (
        (
            ["password", "password_confirm"],
            {
                "password": [
                    ErrorDetail(
                        string="To pole jest wymagane.", code="required"
                    )
                ],
                "password_confirm": [
                    ErrorDetail(
                        string="To pole jest wymagane.", code="required"
                    )
                ],
            },
        ),
        (
            ["password_confirm"],
            {
                "password_confirm": [
                    ErrorDetail(
                        string="To pole jest wymagane.", code="required"
                    )
                ]
            },
        ),
        (
            ["recaptcha_response"],
            {
                "recaptcha_response": [
                    ErrorDetail(
                        string="To pole jest wymagane.", code="required"
                    )
                ]
            },
        ),
    ),
)
def test_register_user_missing_password_or_recaptcha_fields(
    api_client, mocker, user_data, missing_fields, expected_response
):
    for field in missing_fields:
        user_data.pop(field, None)
    mocker.patch("clinic.auth.serializers.verify_recaptcha", return_value=True)

    response = api_client.post(REGISTER_URL, data=user_data, format="json")

    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "field_name, base_value, multiplier, expected_errors, nested_field",
    (
        (
            "first_name",
            "Longtest",
            10,
            [
                ErrorDetail(
                    string="Imię musi zaczynać się wielką literą, a następnie zawierać małe litery.",
                    code="invalid_first_name",
                ),
                ErrorDetail(
                    string="Upewnij się, że to pole ma nie więcej niż 30 znaków.",
                    code="max_length",
                ),
            ],
            None,
        ),
        (
            "last_name",
            "Longuser",
            10,
            [
                ErrorDetail(
                    string="Nazwisko musi zaczynać się wielką literą, a następnie zawierać małe litery.",
                    code="invalid_last_name",
                ),
                ErrorDetail(
                    string="Upewnij się, że to pole ma nie więcej niż 30 znaków.",
                    code="max_length",
                ),
            ],
            None,
        ),
        (
            "email",
            "long" * 65 + "@example.com",
            1,
            [
                ErrorDetail(
                    string="Upewnij się, że to pole ma nie więcej niż 255 znaków.",
                    code="max_length",
                )
            ],
            None,
        ),
        (
            "pesel",
            "12345",
            4,
            [
                "Numer PESEL musi składać się z 11 cyfr.",
                ErrorDetail(
                    string="Upewnij się, że to pole ma nie więcej niż 11 znaków.",
                    code="max_length",
                ),
            ],
            None,
        ),
        (
            "phone_number",
            "12345",
            4,
            [
                ErrorDetail(
                    string="Nieprawidłowy format numeru telefonu. Wprowadź poprawny numer telefonu.",
                    code="invalid_phone_number",
                ),
                ErrorDetail(
                    string="Upewnij się, że to pole ma nie więcej niż 15 znaków.",
                    code="max_length",
                ),
            ],
            None,
        ),
        (
            "address",
            "Test" + "test" * 15,
            1,
            [
                ErrorDetail(
                    string="Upewnij się, że to pole ma nie więcej niż 50 znaków.",
                    code="max_length",
                )
            ],
            "city",
        ),
        (
            "address",
            "Test" + "test" * 15,
            1,
            [
                ErrorDetail(
                    string="Upewnij się, że to pole ma nie więcej niż 50 znaków.",
                    code="max_length",
                )
            ],
            "street",
        ),
    ),
)
def test_register_user_with_long_fields(
    api_client,
    mocker,
    user_data,
    field_name,
    base_value,
    multiplier,
    expected_errors,
    nested_field,
):
    if nested_field:
        user_data[field_name][nested_field] = base_value * multiplier
    else:
        user_data[field_name] = base_value * multiplier

    mocker.patch("clinic.auth.serializers.verify_recaptcha", return_value=True)

    response = api_client.post(REGISTER_URL, data=user_data, format="json")

    if nested_field:
        expected_response = {field_name: {nested_field: expected_errors}}
    else:
        expected_response = {field_name: expected_errors}

    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "field_name, field_value, expected_errors, nested_field",
    (
        (
            "first_name",
            "A",
            [
                ErrorDetail(
                    string="Upewnij się, że pole ma co najmniej 3 znaków.",
                    code="min_length",
                )
            ],
            None,
        ),
        (
            "last_name",
            "A",
            [
                ErrorDetail(
                    string="Upewnij się, że pole ma co najmniej 2 znaków.",
                    code="min_length",
                )
            ],
            None,
        ),
        (
            "email",
            "a@bc.d",
            [
                ErrorDetail(
                    string="Upewnij się, że pole ma co najmniej 7 znaków.",
                    code="min_length",
                ),
                ErrorDetail(
                    string="Podaj poprawny adres e-mail.", code="invalid"
                ),
            ],
            None,
        ),
        ("pesel", "12345", ["Numer PESEL musi składać się z 11 cyfr."], None),
        (
            "phone_number",
            "12345",
            [
                ErrorDetail(
                    string="Upewnij się, że pole ma co najmniej 7 znaków.",
                    code="min_length",
                )
            ],
            None,
        ),
        (
            "address",
            "A",
            [
                ErrorDetail(
                    string="Upewnij się, że pole ma co najmniej 3 znaków.",
                    code="min_length",
                )
            ],
            "city",
        ),
        (
            "address",
            "A",
            [
                ErrorDetail(
                    string="Upewnij się, że pole ma co najmniej 3 znaków.",
                    code="min_length",
                )
            ],
            "street",
        ),
    ),
)
def test_register_user_with_short_fields(
    api_client,
    mocker,
    user_data,
    field_name,
    field_value,
    expected_errors,
    nested_field,
):
    if nested_field:
        user_data[field_name][nested_field] = field_value
    else:
        user_data[field_name] = field_value

    mocker.patch("clinic.auth.serializers.verify_recaptcha", return_value=True)

    response = api_client.post(REGISTER_URL, data=user_data, format="json")

    if nested_field:
        expected_response = {field_name: {nested_field: expected_errors}}
    else:
        expected_response = {field_name: expected_errors}

    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "field_name, field_value, expected_error, nested_field",
    (
        (
            "first_name",
            "test",
            ErrorDetail(
                string="Imię musi zaczynać się wielką literą, a następnie zawierać małe litery.",
                code="invalid_first_name",
            ),
            None,
        ),
        (
            "last_name",
            "user",
            ErrorDetail(
                string="Nazwisko musi zaczynać się wielką literą, a następnie zawierać małe litery.",
                code="invalid_last_name",
            ),
            None,
        ),
        (
            "address",
            "test",
            ErrorDetail(
                string="Nazwa miasta musi zaczynać się wielką literą i zawierać wyłącznie litery, spacje i myślniki.",
                code="invalid_city",
            ),
            "city",
        ),
        (
            "address",
            "test",
            ErrorDetail(
                string="Nazwa ulicy musi zaczynać się wielką literą i zawierać wyłącznie litery, spacje i myślniki.",
                code="invalid_street",
            ),
            "street",
        ),
    ),
)
def test_register_user_fields_case_insensitive(
    api_client,
    mocker,
    user_data,
    field_name,
    field_value,
    expected_error,
    nested_field,
):
    if nested_field:
        user_data[field_name][nested_field] = field_value
    else:
        user_data[field_name] = field_value

    mocker.patch("clinic.auth.serializers.verify_recaptcha", return_value=True)

    response = api_client.post(REGISTER_URL, data=user_data, format="json")

    if nested_field:
        expected_response = {field_name: {nested_field: [expected_error]}}
    else:
        expected_response = {field_name: [expected_error]}

    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_response,
    )


@pytest.mark.django_db
def test_register_user_email_case_insensitive(api_client, mocker, user_data):
    User.objects.create_user(
        email="test@example.com",
        password="somepassword",
        first_name="Sensitive",
        last_name="Email",
    )

    user_data["email"] = "TEST@example.com"
    mocker.patch("clinic.auth.serializers.verify_recaptcha", return_value=True)

    response = api_client.post(REGISTER_URL, data=user_data, format="json")

    expected_error = "Ten adres e-mail jest już używany."
    expected_response = {"email": [expected_error]}

    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "input_data, content_type, format, expected_status, expected_response",
    (
        (
            {},
            None,
            "json",
            status.HTTP_400_BAD_REQUEST,
            {
                "email": [
                    ErrorDetail(
                        string="To pole jest wymagane.", code="required"
                    )
                ],
                "first_name": [
                    ErrorDetail(
                        string="To pole jest wymagane.", code="required"
                    )
                ],
                "last_name": [
                    ErrorDetail(
                        string="To pole jest wymagane.", code="required"
                    )
                ],
                "password": [
                    ErrorDetail(
                        string="To pole jest wymagane.", code="required"
                    )
                ],
                "password_confirm": [
                    ErrorDetail(
                        string="To pole jest wymagane.", code="required"
                    )
                ],
                "recaptcha_response": [
                    ErrorDetail(
                        string="To pole jest wymagane.", code="required"
                    )
                ],
                "pesel": [
                    ErrorDetail(
                        string="To pole jest wymagane.", code="required"
                    )
                ],
                "phone_number": [
                    ErrorDetail(
                        string="To pole jest wymagane.", code="required"
                    )
                ],
                "address": [
                    ErrorDetail(
                        string="To pole jest wymagane.", code="required"
                    )
                ],
            },
        ),
        (
            {
                "first_name": "",
                "last_name": "",
                "email": "",
                "role": "",
                "password": "",
                "password_confirm": "",
                "recaptcha_response": "",
                "pesel": "",
                "phone_number": "",
                "address": {
                    "city": "",
                    "street": "",
                    "country": "",
                    "house_number": "",
                    "post_code": "",
                },
            },
            None,
            "json",
            status.HTTP_400_BAD_REQUEST,
            {
                "address": {
                    "city": [
                        ErrorDetail(
                            string="To pole nie może być puste.",
                            code="blank",
                        )
                    ],
                    "country": [
                        ErrorDetail(
                            string="Pole nie może mieć wartości null.",
                            code="null",
                        )
                    ],
                    "house_number": [
                        ErrorDetail(
                            string="To pole nie może być puste.",
                            code="blank",
                        )
                    ],
                    "post_code": [
                        ErrorDetail(
                            string="To pole nie może być puste.",
                            code="blank",
                        )
                    ],
                    "street": [
                        ErrorDetail(
                            string="To pole nie może być puste.",
                            code="blank",
                        )
                    ],
                },
                "email": [
                    ErrorDetail(
                        string="To pole nie może być puste.",
                        code="blank",
                    )
                ],
                "first_name": [
                    ErrorDetail(
                        string="To pole nie może być puste.",
                        code="blank",
                    )
                ],
                "last_name": [
                    ErrorDetail(
                        string="To pole nie może być puste.",
                        code="blank",
                    )
                ],
                "password": [
                    ErrorDetail(
                        string="To pole nie może być puste.",
                        code="blank",
                    )
                ],
                "password_confirm": [
                    ErrorDetail(
                        string="To pole nie może być puste.",
                        code="blank",
                    )
                ],
                "recaptcha_response": [
                    ErrorDetail(
                        string="To pole nie może być puste.",
                        code="blank",
                    )
                ],
                "pesel": [
                    ErrorDetail(
                        string="To pole nie może być puste.",
                        code="blank",
                    )
                ],
                "phone_number": [
                    ErrorDetail(
                        string="To pole nie może być puste.",
                        code="blank",
                    )
                ],
                "role": [
                    ErrorDetail(
                        string='"" nie jest poprawnym wyborem.',
                        code="invalid_choice",
                    )
                ],
            },
        ),
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
            "first_name=Test&last_name=User&email=test@example.com&password=testpassword&password_confirm=testpassword",
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
def test_register_user_invalid_input_format(
    api_client,
    input_data,
    content_type,
    format,
    expected_status,
    expected_response,
):
    if not format:
        response = api_client.post(
            REGISTER_URL, data=input_data, content_type=content_type
        )

    if not content_type:
        response = api_client.post(
            REGISTER_URL, data=input_data, format=format
        )

    assert (response.status_code, response.data) == (
        expected_status,
        expected_response,
    )


@pytest.mark.django_db
def test_register_user_while_logged_in(api_client, mocker, user_data):
    mocker.patch("clinic.auth.serializers.verify_recaptcha", return_value=True)
    registration_response = api_client.post(
        REGISTER_URL, data=user_data, format="json"
    )
    assert registration_response.status_code == status.HTTP_201_CREATED

    user = User.objects.get(email=user_data["email"])

    api_client.force_authenticate(user=user)

    mocker.patch("clinic.auth.serializers.verify_recaptcha", return_value=True)
    response = api_client.post(REGISTER_URL, data=user_data, format="json")

    expected_response = {
        "email": [
            ErrorDetail(
                string="Ten adres e-mail jest już używany.", code="unique"
            )
        ],
        "pesel": [
            "Podane informacje są niekompletne lub nieprawidłowe. Sprawdź i wprowadź je ponownie."
        ],
    }

    assert (response.status_code, response.data) == (
        status.HTTP_400_BAD_REQUEST,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize("http_method", ("get", "patch", "delete", "put"))
def test_register_user_http_methods_not_allowed(api_client, http_method):
    method = getattr(api_client, http_method)
    response = method(REGISTER_URL)
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
