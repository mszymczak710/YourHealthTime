import { UserRole } from '@auth/types';

export interface TableAction {
  action: (row: any) => void;
  disabled?: (row: any) => boolean;
  disabledLabel?: (row: any) => string;
  color?: 'primary' | 'accent' | 'warn';
  icon?: string;
  label?: string;
  permissions: UserRole[];
}
