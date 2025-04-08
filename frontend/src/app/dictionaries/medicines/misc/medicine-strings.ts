export const medicineStrings = Object.freeze({
  medicine: {
    active_ingredients: {
      label: 'Składniki aktywne'
    },
    form: {
      name: {
        label: 'Postać leku',
        placeholder: 'Wpisz postać leku'
      }
    },
    name: {
      label: 'Nazwa',
      placeholder: 'Wpisz nazwę'
    },
    readable_id: {
      label: 'ID',
      placeholder: 'Wpisz ID'
    },
    type_of_medicine: {
      name: {
        label: 'Typ leku',
        placeholder: 'Wpisz typ leku'
      }
    }
  }
});

export type MedicineStrings = typeof medicineStrings;
