DO $$
DECLARE
    seq_name TEXT;
    seq_names TEXT[] := ARRAY [
        'clinic_user_readable_id_seq',
        'clinic_doctor_readable_id_seq',
        'clinic_nurse_readable_id_seq',
        'clinic_patient_readable_id_seq',
        'clinic_country_readable_id_seq',
        'clinic_disease_readable_id_seq',
        'clinic_ingredient_readable_id_seq',
        'clinic_medicine_readable_id_seq',
        'clinic_office_readable_id_seq',
        'clinic_specialization_readable_id_seq',
        'clinic_prescription_readable_id_seq',
        'clinic_visit_readable_id_seq'
    ];
BEGIN
    FOR i IN 1..array_length(seq_names, 1) LOOP
        seq_name := seq_names[i];
        EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I START WITH 1 INCREMENT BY 1;', seq_name);
    END LOOP;
END $$;