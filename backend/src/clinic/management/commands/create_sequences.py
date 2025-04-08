from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = "Creates sequences in the database if they do not exist."

    def handle(self, *args, **kwargs):
        seq_names = [
            "clinic_user_readable_id_seq",
            "clinic_doctor_readable_id_seq",
            "clinic_nurse_readable_id_seq",
            "clinic_patient_readable_id_seq",
            "clinic_country_readable_id_seq",
            "clinic_disease_readable_id_seq",
            "clinic_ingredient_readable_id_seq",
            "clinic_medicine_readable_id_seq",
            "clinic_office_readable_id_seq",
            "clinic_specialization_readable_id_seq",
            "clinic_prescription_readable_id_seq",
            "clinic_visit_readable_id_seq",
        ]

        with connection.cursor() as cursor:
            for seq_name in seq_names:
                cursor.execute(
                    "SELECT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = %s);",
                    [seq_name],
                )
                exists = cursor.fetchone()[0]

                if exists:
                    self.stdout.write(
                        f"Sequence {self.style.WARNING(seq_name)} already exists."
                    )
                else:
                    cursor.execute(
                        f"CREATE SEQUENCE {seq_name} START WITH 1 INCREMENT BY 1;"
                    )
                    self.stdout.write(
                        f"Sequence {self.style.SUCCESS(seq_name)} has been created."
                    )
