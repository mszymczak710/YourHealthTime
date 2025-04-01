import { UserRole } from '@auth/types';

export interface TableAction {
  action: (row: any) => void;
  color?: 'primary' | 'accent' | 'warn';
  icon?: string;
  label?: string;
  permissions: UserRole[];
}
