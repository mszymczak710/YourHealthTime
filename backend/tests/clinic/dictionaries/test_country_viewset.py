import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.exceptions import ErrorDetail


@pytest.mark.django_db
def test_user_can_list_countries(api_client, country_instances):
    url = reverse("country-list")
    ordering = "readable_id"
    response = api_client.get(f"{url}?ordering={ordering}")

    assert (response.status_code, len(response.data)) == (
        status.HTTP_200_OK,
        3,
    )


@pytest.mark.parametrize(
    "filter_param, filter_value, expected_count",
    (
        ("name", "Polska", 1),
        ("code", "DE", 1),
    ),
)
def test_filter_country(
    api_client,
    filter_param,
    filter_value,
    expected_count,
    country_instances,
):
    url = reverse("country-list")
    ordering = "readable_id"
    response = api_client.get(
        f"{url}?{filter_param}={filter_value}&ordering={ordering}"
    )

    assert (response.status_code, len(response.data)) == (
        status.HTTP_200_OK,
        expected_count,
    )


@pytest.mark.django_db
def test_user_can_retrieve_specific_country_details(
    api_client, country_instances
):
    url = reverse("country-detail", args=(country_instances[0].pk,))
    response = api_client.get(url)
    assert (
        response.status_code,
        response.data["name"],
        response.data["code"],
    ) == (status.HTTP_200_OK, "Polska", "PL")


@pytest.mark.django_db
def test_user_cannot_retrieve_details_of_nonexistent_country(
    api_client, random_uuid
):
    url = reverse("country-detail", args=(str(random_uuid),))
    response = api_client.get(url)

    expected_error = ErrorDetail("Nie znaleziono.", code="not_found")
    expected_response = {"detail": expected_error}

    assert (response.status_code, response.data) == (
        status.HTTP_404_NOT_FOUND,
        expected_response,
    )


@pytest.mark.django_db
@pytest.mark.parametrize("http_method", ("delete", "patch", "put"))
def test_invalid_http_methods_are_rejected_on_country_detail(
    api_client, http_method, country_instances
):
    url = reverse("country-detail", args=(country_instances[0].pk,))

    method = getattr(api_client, http_method)
    response = method(url)
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


@pytest.mark.django_db
def test_post_method_not_supported_for_countries_list(api_client):
    url = reverse("country-list")
    country_data = {
        "name": "Rosja",
    }

    response = api_client.post(url, country_data, format="json")
    assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
