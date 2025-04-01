import { BaseType } from '@core/types';

import { OfficeType } from './office-type';

export interface Office extends BaseType {
  floor: number;
  office_type: OfficeType;
  room_number: number;
}
