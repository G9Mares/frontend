import { TicketStatus } from '../enums/ticket-status.enum';
import { SupportUserRole } from '../enums/support-user-role.enum';

export interface RequesterSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface AreaSummary {
  id: string;
  name: string;
}

export interface SupportUserSummary {
  id: string;
  name: string;
  email: string;
  role: SupportUserRole;
}

export interface TicketAttachmentSummary {
  id: string;
  extension: string;
}

export interface Ticket {
  id: string;
  requester_id: string;
  area_id: string;
  handled_by_id: string | null;
  requester: RequesterSummary;
  area: AreaSummary;
  handled_by: SupportUserSummary | null;
  subject: string;
  description: string;
  status: TicketStatus;
  status_comment: string | null;
  attachments: TicketAttachmentSummary[];
  created_at: string;
  last_update_at: string;
  last_update_acc: string;
}

export interface CreateTicketRequest {
  requester_id: string;
  area_id: string;
  subject: string;
  description: string;
}
