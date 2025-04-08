from django.db import connection, models


class AutoIncrementField(models.PositiveIntegerField):
    """
    Niestandardowe pole zapewniające automatyczne zwiększanie wartości w modelach Django przy użyciu sekwencji PostgreSQL.

    To pole typu dodatnia liczba całkowita automatycznie generuje unikalną wartość sekwencyjną
    podczas zapisu nowego obiektu modelu. Wykorzystuje do tego sekwencję PostgreSQL,
    co zapewnia atomowe zwiększanie wartości.

    Nazwa sekwencji jest tworzona na podstawie nazwy tabeli modelu oraz nazwy pola,
    dzięki czemu każde pole posiada własną dedykowaną sekwencję.

    Jeżeli wartość pola została już ustawiona lub obiekt nie jest nowy (czyli `add=False`),
    pole nie jest nadpisywane i używana jest domyślna logika `pre_save`.
    """

    def pre_save(self, model_instance, add):
        """
        Określa wartość pola tuż przed zapisaniem obiektu modelu.

        Argumenty:
            model_instance: Instancja modelu, w którym znajduje się to pole.
            add: Wartość logiczna określająca, czy to nowa instancja (True) czy aktualizacja (False).

        Zwraca:
            Wartość, która ma zostać zapisana w tym polu.
        """
        if add and not getattr(model_instance, self.attname):
            # Generowanie kolejną wartość sekwencji, jeśli to nowy obiekt
            # i pole nie jest jeszcze uzupełnione.
            with connection.cursor() as cursor:
                sequence_name = (
                    f"{model_instance._meta.db_table}_{self.attname}_seq"
                )
                cursor.execute(f"SELECT nextval('{sequence_name}')")
                value = cursor.fetchone()[0]
                setattr(model_instance, self.attname, value)
                return value
        else:
            # Dla istniejących obiektów lub jeśli pole już ma wartość — użycie domyślnej logiki.
            return super().pre_save(model_instance, add)
