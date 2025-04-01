from rest_framework import serializers

from clinic.auth.serializers import UserReadSerializer
from clinic.dictionaries.serializers import SpecializationSerializer
from clinic.roles.models import Doctor, Nurse, Patient
from clinic.serializers import AddressReadSerializer, AddressWriteSerializer


class DoctorReadSerializer(serializers.ModelSerializer):
    user = UserReadSerializer()
    specializations = SpecializationSerializer(many=True)

    class Meta:
        model = Doctor
        fields = "__all__"


class DoctorWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = "__all__"
        read_only_fields = (
            "id",
            "readable_id",
            "job_execution_number",
            "user",
        )

    def to_representation(self, instance):
        # Zwrócenie reprezentacji odczytu po zapisie
        serializer = DoctorReadSerializer(instance)
        return serializer.data


class NurseSerializer(serializers.ModelSerializer):
    user = UserReadSerializer(read_only=True)

    class Meta:
        model = Nurse
        fields = "__all__"


class PatientBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = (
            "address",
            "readable_id",
            "id",
            "pesel",
            "birth_date",
            "gender",
            "phone_number",
        )
        read_only_fields = (
            "id",
            "readable_id",
            "pesel",
            "birth_date",
            "gender",
        )


class PatientDetailSerializer(PatientBaseSerializer):
    user = UserReadSerializer()
    address = AddressReadSerializer()

    class Meta(PatientBaseSerializer.Meta):
        fields = PatientBaseSerializer.Meta.fields + ("user",)


class PatientListSerializer(PatientBaseSerializer):
    user = UserReadSerializer()
    address = serializers.SerializerMethodField()

    class Meta(PatientBaseSerializer.Meta):
        fields = PatientBaseSerializer.Meta.fields + ("user",)

    def get_address(self, obj):
        """
        Zwrócenie sformatowanego adresu jako pojedynczy ciąg znaków.

        W przypadku braku adresu zwracana jest wartość None.

        Formatowany adres przyjmuje postać:
        "ul. <ulica> <nr domu>/<nr lokalu>, <kod pocztowy> <miasto>, <kraj>"

        Przykład:
        "ul. Polna 144U/5, 87-100 Toruń, Polska"

        Argumenty:
            obj (Patient): Instancja pacjenta.

        Zwraca:
            str lub None: Sformatowany adres lub None.
        """
        if not obj.address:
            return None

        country_name = obj.address.country.name if obj.address.country else ""
        address_parts = [
            f"ul. {obj.address.street} {obj.address.house_number}",
            f"/{obj.address.apartment_number}"
            if obj.address.apartment_number
            else "",
            f", {obj.address.post_code} {obj.address.city}",
            f", {country_name}" if country_name else "",
        ]
        return "".join(address_parts).strip()


class PatientWriteSerializer(PatientBaseSerializer):
    address = AddressWriteSerializer()

    def update(self, instance, validated_data):
        """
        Aktualizacja danych pacjenta wraz z adresem.

        Jeżeli w danych znajduje się adres, zostaje on zaktualizowany po zapisaniu
        pozostałych pól pacjenta.

        Argumenty:
            instance: Istniejąca instancja pacjenta.
            validated_data: Zweryfikowane dane wejściowe.

        Zwraca:
            Zaktualizowana instancja pacjenta.
        """
        address_data = validated_data.pop("address", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if address_data:
            address = instance.address
            for address_attr, address_value in address_data.items():
                setattr(address, address_attr, address_value)
            address.save()

        return instance

    def to_representation(self, instance):
        # Zwrócenie reprezentacji szczegółowej pacjenta po zapisie
        serializer = PatientDetailSerializer(instance)
        return serializer.data
