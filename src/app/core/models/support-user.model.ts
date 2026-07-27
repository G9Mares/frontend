import { SupportUserRole } from '../enums/support-user-role.enum';

export interface SupportUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: SupportUserRole;
  is_active: boolean;
  created_at: string;
  last_update_at: string;
  last_update_acc: string;
}
