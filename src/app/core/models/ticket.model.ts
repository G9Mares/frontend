import { TicketStatus } from '../enums/ticket-status.enum';
import { Attachment } from './attachment.model';

export interface Ticket {
  id: string;
  requester_id: string;
  area_id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  status_comment: string | null;
  handled_by_id: string | null;
  attachments: Attachment[];
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
