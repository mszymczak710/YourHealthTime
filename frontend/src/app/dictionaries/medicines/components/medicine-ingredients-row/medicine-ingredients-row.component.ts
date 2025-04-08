import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { sprintf } from 'sprintf-js';

import { ClassExtender } from '@core/misc';

import { StringsLoader } from '@dictionaries/medicines/misc';
import { ActiveIgredient } from '@dictionaries/medicines/types';

export interface MedicineIngredientsRowComponent extends StringsLoader {}

@Component({
  selector: 'yht-medicine-ingredients-row',
  standalone: true,
  imports: [],
  templateUrl: './medicine-ingredients-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ClassExtender([StringsLoader])
export class MedicineIngredientsRowComponent {
  @Input() activeIngredients: ActiveIgredient[];

  getActiveIngredientInfo(ingredient: ActiveIgredient): string {
    return sprintf(this.strings.activeIngredientDetails, ingredient.ingredient.name, ingredient.quantity, ingredient.unit);
  }
}
