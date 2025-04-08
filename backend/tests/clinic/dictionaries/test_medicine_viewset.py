import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.exceptions import ErrorDetail


@pytest.mark.django_db
def test_doctor_can_list_medicines(authenticated_doctor, medicine_instances):
    api_client, _ = authenticated_doctor
    url = reverse("medicine-list")
    ordering = "readable_id"
    response = api_client.get(f"{url}?ordering={ordering}")

    assert (response.status_code, len(response.data)) == (
        status.HTTP_200_OK,
        4,
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "filter_param, filter_value, expected_count",
    (
        ("name", "Euthyrox", 1),
        ("type_of_medicine__name", "Lek przeciwzapalny niesteroidowy", 2),
        ("form__name", "Kapsułka", 0),
        ("active_ingredients__name", "Kwas acetylosalicylowy", 1),
    ),
)
def test_filter_medicine(
    authenticated_doctor,
    filter_param,
    filter_value,
    expected_count,
    medicine_instances,
):
    api_client, _ = authenticated_doctor
    url = reverse("medicine-list")
    ordering = "readable_id"
    response = api_client.get(
        f"{url}?{filter_param}={filter_value}&ordering={ordering}"
    )

    assert (response.status_code, len(response.data)) == (
        status.HTTP_200_OK,
        expected_count,
    )


@pytest.mark.django_db
def test_doctor_can_retrieve_specific_medicine_details(
    authenticated_doctor, medicine_instances
):
    api_client, _ = authenticated_doctor
    url = reverse("medicine-detail", args=(medicine_instances[0].pk,))
    response = api_client.get(url)

    active_ingredients = [
        {
            "name": ingredient["ingredient"]["name"],
            "quantity": ingredient["quantity"],
            "unit": ingredient["unit"],
        }
        for ingredient in response.data["active_ingredients"]
    ]

    expected_active_ingredients = [
        {"name": "Lewotyroksyna sodowa", "quantity": "100.000", "unit": "mcg"}
    ]

    assert (
        response.status_code,
        response.data["name"],
        response.data["type_of_medicine"]["name"],
        active_ingredients,
        response.data["form"]["name"],
    ) == (
        status.HTTP_200_OK,
        "Euthyrox",
        "Lek na niedoczynność tarczycy",
        expected_active_ingredients,
        "Tabletka",
    )


@pytest.mark.django_db
def test_doctor_cannot_retrieve_details_of_nonexistent_medicine(
    authenticated_doctor, random_uuid
):
    api_client, _ = authenticated_doctor
    url = reverse("medicine-detail", args=(str(random_uuid),))
    response = api_client.get(url)

    expected_error = ErrorDetail("Nie znaleziono.", code="not_found")
    expected_response = {"detail": expected_error}

    assert (response.status_code, response.data) == (
        status.HTTP_404_NOT_FOUND,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize("url_name", (("medicine-list"), ("medicine-detail")))
def test_unauthenticated_user_cannot_list_or_retrieve_medicines(
    api_client, medicine_instances, url_name
):
    medicine = medicine_instances[0]
    url = reverse(
        url_name, args=(medicine.pk,) if "detail" in url_name else ()
    )
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
    "user_fixture", (("authenticated_patient"), ("authenticated_nurse"))
)
@pytest.mark.parametrize("url_name", (("medicine-list"), ("medicine-detail")))
def test_user_with_invalid_role_cannot_list_or_retrieve_medicines(
    request, user_fixture, url_name, medicine_instances
):
    api_client, _ = request.getfixturevalue(user_fixture)
    medicine = medicine_instances[0]
    url = reverse(
        url_name, args=(medicine.pk,) if "detail" in url_name else ()
    )
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
@pytest.mark.parametrize("http_method", ("delete", "patch", "put"))
def test_invalid_http_methods_are_rejected_on_medicine_detail(
    authenticated_doctor, http_method, medicine_instances
):
    api_client, _ = authenticated_doctor
    url = reverse("medicine-detail", args=(medicine_instances[0].pk,))

    method = getattr(api_client, http_method)
    response = method(url)
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@pytest.mark.django_db
def test_post_method_not_supported_for_medicines_list(authenticated_doctor):
    api_client, _ = authenticated_doctor
    url = reverse("medicine-list")
    medicine_data = {
        "name": "Testowy lek",
        "dosage": "0mg",
        "type_of_medicine": "Testowy typ",
        "form": "Tabletka",
        "active_ingredients": ["Testowy skladnik"],
    }

    response = api_client.post(url, medicine_data, format="json")
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
