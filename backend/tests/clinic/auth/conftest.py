import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


@pytest.fixture
def user_data(country_instances):
    return {
        "first_name": "Test",
        "last_name": "User",
        "email": "test@example.com",
        "password": "testpassword",
        "password_confirm": "testpassword",
        "recaptcha_response": "valid_recaptcha",
        "pesel": "01251342866",
        "phone_number": "+48727516980",
        "address": {
            "street": "Polna",
            "house_number": "1A",
            "apartment_number": "15",
            "post_code": "87-100",
            "city": "Toruń",
            "country": str(country_instances[0].pk),
        },
    }


@pytest.fixture
def email_verification_url(user_not_confirmed):
    uidb64 = urlsafe_base64_encode(force_bytes(user_not_confirmed.pk))
    token = default_token_generator.make_token(user_not_confirmed)
    return reverse("verify-email", args=(uidb64, token))


@pytest.fixture
def user_factory(db):
    def create_user(**kwargs):
        user_defaults = {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "password": "testpassword",
            "role": "P",
            "is_active": True,
            "email_confirmed": True,
        }
        user_defaults.update(kwargs)
        user = get_user_model().objects.create_user(**user_defaults)
        return user

    return create_user


@pytest.fixture
def user(user_factory):
    return user_factory()


@pytest.fixture
def user_not_confirmed(user_factory):
    return user_factory(email_confirmed=False, is_active=False)


@pytest.fixture
def inactive_user(user_factory):
    return user_factory(is_active=False)


@pytest.fixture
def authenticated_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def change_password_data():
    return {
        "old_password": "testpassword",
        "password": "newpassword123",
        "password_confirm": "newpassword123",
    }


@pytest.fixture
def reset_password_url(user):
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return reverse(
        "reset-password-confirm", kwargs={"uidb64": uidb64, "token": token}
    )


@pytest.fixture
def set_password_data():
    return {
        "password": "newpassword123",
        "password_confirm": "newpassword123",
    }
