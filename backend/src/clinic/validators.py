import re

from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _

FirstNameValidator = RegexValidator(
    regex=r"^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]*(?:[-' ][A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)*$",
    message=_(
        "Imię musi zaczynać się wielką literą, a następnie zawierać małe litery."
    ),
    code="invalid_first_name",
)

LastNameValidator = RegexValidator(
    regex=r"^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]*(?:[-' ][A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)*$",
    message=_(
        "Nazwisko musi zaczynać się wielką literą, a następnie zawierać małe litery."
    ),
    code="invalid_last_name",
)

HouseNumberValidator = RegexValidator(
    regex=r"^[1-9]\d{0,2}[A-Za-z]?$",
    message=_(
        "Numer domu musi zaczynać się od cyfry innej niż zero, opcjonalnie może zawierać do dwóch dodatkowych cyfr i kończyć się pojedynczą literą."
    ),
    code="invalid_house_number",
)

ApartmentNumberValidator = RegexValidator(
    regex=r"^[1-9]\d{0,2}$",
    message=_("Numer mieszkania musi być liczbą z zakresu od 1 do 999."),
    code="invalid_apartment_number",
)

CityValidator = RegexValidator(
    regex=r"^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż -]*(\s[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż -]*)*$",
    message=_(
        "Nazwa miasta musi zaczynać się wielką literą i zawierać wyłącznie litery, spacje i myślniki."
    ),
    code="invalid_city",
)

StreetValidator = RegexValidator(
    regex=r"^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż -]*(\s[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż -]*)*$",
    message=_(
        "Nazwa ulicy musi zaczynać się wielką literą i zawierać wyłącznie litery, spacje i myślniki."
    ),
    code="invalid_street",
)


PostcodeValidator = RegexValidator(
    regex=r"^\d{2}-\d{3}$",
    message=_(
        "Nieprawidłowy format kodu pocztowego. Wprowadź poprawny kod w formacie XX-XXX."
    ),
    code="invalid_post_code",
)


PhoneNumberValidator = RegexValidator(
    regex=r"^\+?(\d{1,3}[-\s]?)?(\(0\d{1,2}\)|0\d{1,2}[-\s]?)?(\d{1,4}[-\s]?){2,3}\d{1,4}$",
    message=_(
        "Nieprawidłowy format numeru telefonu. Wprowadź poprawny numer telefonu."
    ),
    code="invalid_phone_number",
)


def pesel_validator(value):
    if not re.match(r"^\d{11}$", value):
        raise ValidationError(
            _("Numer PESEL musi składać się z 11 cyfr."),
            code="invalid_pesel",
        )

    weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
    check_sum = sum(w * int(c) for w, c in zip(weights, value)) % 10
    if (10 - check_sum) % 10 != int(value[-1]):
        raise ValidationError(
            _("Nieprawidłowy numer PESEL."),
            code="invalid_pesel",
        )


JobExecutionNumberValidator = RegexValidator(
    regex=r"^[1-9]\d{6}$",
    message=_(
        "Numer wykonywania zawodu musi składać się z 7 cyfr i nie może zaczynać się od 0."
    ),
    code="invalid_job_execution_number",
)

NursingLicenseNumberValidator = RegexValidator(
    regex=r"^[1-9]\d{6}$",
    message=_(
        "Numer licencji pielęgniarskiej musi składać się z 7 cyfr i nie może zaczynać się od 0."
    ),
    code="invalid_nursing_license_number",
)

PrescriptionCodeValidator = RegexValidator(
    regex=r"^\d{4}$",
    message=_("Kod recepty musi składać się z 4 cyfr."),
    code="invalid_prescription_code",
)
