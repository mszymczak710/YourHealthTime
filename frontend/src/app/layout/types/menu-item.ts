import { UserRole } from '@auth/types';

export interface MenuItem {
  action?: () => void;
  children?: MenuItem[];
  label: string;
  roles?: UserRole[];
  routerLink?: string[];
}
