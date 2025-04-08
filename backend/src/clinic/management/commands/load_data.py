import json
import os
from gettext import ngettext
from typing import Any, Dict, Optional, Type

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db.models import Model
from django_countries.data import COUNTRIES

from clinic.dictionaries.models import (
    Country,
    Disease,
    Ingredient,
    Medicine,
    MedicineForm,
    MedicineIngredient,
    MedicineType,
    Office,
    OfficeType,
    Specialization,
)


class Command(BaseCommand):
    """
    Wczytywanie danych do modeli: Specialization, Disease, Medicine, Office, Country.

    Odczytywanie danych z plików JSON i zapisywanie ich do bazy danych.
    Jeśli rekord już istnieje (na podstawie nazwy), zostaje pominięty.
    """

    help = "Wczytywanie danych do słowników z plików JSON"

    # Ścieżki do plików JSON względem ustawienia BASE_DIR
    data_paths = {
        Specialization: "specializations.json",
        Disease: "diseases.json",
        Medicine: "medicines.json",
        Office: "offices.json",
    }

    def load_data(
        self, model: Type[Model], defaults: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Wczytywanie danych z pliku JSON do wskazanego modelu.

        Argumenty:
            model: Model Django do załadowania danych.
            defaults: Domyślne wartości dla nowych obiektów (opcjonalne).
        """
        if defaults is None:
            defaults = {}

        file_path = os.path.join(
            settings.BASE_DIR,
            "src",
            "clinic",
            "dictionaries",
            "data",
            self.data_paths[model],
        )

        new_objects_count = 0
        existing_objects_count = 0

        try:
            with open(file_path, "r") as file:
                data = json.load(file)
                for item in data:
                    if model == Medicine:
                        created = self.load_medicine(item, defaults)
                    elif model == Office:
                        created = self.load_office(item, defaults)
                    else:
                        created = self.load_generic_model(
                            model, item, defaults
                        )

                    if created:
                        new_objects_count += 1
                    else:
                        existing_objects_count += 1

            self.log_results(model, new_objects_count, existing_objects_count)

        except (FileNotFoundError, json.JSONDecodeError) as e:
            self.stderr.write(self.style.ERROR(f"Error loading data: {e}\n\n"))
            raise CommandError("Error loading data") from e

    def load_medicine(
        self, item: Dict[str, Any], defaults: Dict[str, Any]
    ) -> bool:
        """
        Wczytywanie pojedynczego rekordu leku.
        """
        type_obj, _ = MedicineType.objects.get_or_create(
            name=item["type_of_medicine"]
        )
        form_obj, _ = MedicineForm.objects.get_or_create(name=item["form"])

        medicine, created = Medicine.objects.get_or_create(
            name=item["name"],
            defaults={
                **defaults,
                "type_of_medicine": type_obj,
                "form": form_obj,
            },
        )

        for ingredient_data in item["active_ingredients"]:
            ingredient, _ = Ingredient.objects.get_or_create(
                name=ingredient_data["name"]
            )
            MedicineIngredient.objects.update_or_create(
                medicine=medicine,
                ingredient=ingredient,
                defaults={
                    "quantity": ingredient_data["quantity"],
                    "unit": ingredient_data["unit"],
                },
            )

        return created

    def load_office(
        self, item: Dict[str, Any], defaults: Dict[str, Any]
    ) -> bool:
        """
        Wczytywanie pojedynczego rekordu gabinetu.
        """
        type_obj, _ = OfficeType.objects.get_or_create(
            name=item["office_type"]
        )
        _, created = Office.objects.get_or_create(
            office_type=type_obj,
            floor=item["floor"],
            room_number=item["room_number"],
            defaults=defaults,
        )
        return created

    def load_generic_model(
        self,
        model: Type[Model],
        item: Dict[str, Any],
        defaults: Dict[str, Any],
    ) -> bool:
        """
        Wczytywanie ogólnego modelu słownikowego (np. choroby, specjalizacji).
        """
        _, created = model.objects.get_or_create(
            name=item["name"], defaults={**defaults, **item}
        )
        return created

    def load_countries(self) -> None:
        """
        Wczytywanie danych krajów z django_countries.
        """
        new_objects_count = 0
        existing_objects_count = 0

        for code, name in COUNTRIES.items():
            country, created = Country.objects.get_or_create(
                code=code, name=name
            )

            if created:
                new_objects_count += 1
            else:
                existing_objects_count += 1

        self.log_results(Country, new_objects_count, existing_objects_count)

    def log_results(
        self, model: Type[Model], new_count: int, existing_count: int
    ) -> None:
        """
        Logowanie wyników po załadowaniu danych.
        """
        model_name = self.style.NOTICE(model.__name__)

        if new_count > 0:
            self.stdout.write(
                f"Added {self.style.SUCCESS(new_count)} new {model_name} objects."
            )

        if existing_count > 0:
            model_name_plural = ngettext(
                f"{model._meta.verbose_name}",
                f"{model._meta.verbose_name_plural}",
                existing_count,
            )
            self.stdout.write(
                f"{self.style.WARNING(existing_count)} {self.style.NOTICE(model_name_plural)} already loaded.\n"
            )

    def handle(self, *args, **kwargs):
        """
        Uruchomienie komendy zarządzającej do wczytania danych z plików JSON.
        """
        self.stdout.write(
            self.style.HTTP_INFO("\n\nStarting data loading...\n\n")
        )

        try:
            self.load_data(Specialization)
            self.load_data(Disease)
            self.load_data(Medicine)
            self.load_data(Office)
            self.load_countries()

            self.stdout.write(
                self.style.SUCCESS("\n\nData loading process completed.\n\n")
            )

        except CommandError as e:
            self.stderr.write(
                self.style.ERROR(f"Data loading failed: {e}\n\n")
            )
