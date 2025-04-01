from rest_framework import serializers

from clinic.dictionaries.models import Country
from clinic.dictionaries.serializers import CountrySerializer
from clinic.roles.models import Address


class AddressWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = (
            "country",
            "street",
            "house_number",
            "apartment_number",
            "city",
            "post_code",
        )

    def to_internal_value(self, data):
        """
        Ensure country is always stored as UUID.
        """
        if isinstance(data.get("country"), Country):
            data["country"] = str(data["country"].id)
        return super().to_internal_value(data)


class AddressReadSerializer(AddressWriteSerializer):
    country = CountrySerializer()
