import Decimal from 'decimal.js';

import { Ingredient } from './ingredient';

export interface ActiveIgredient {
  ingredient: Ingredient;
  quantity: Decimal;
  unit: string;
}
