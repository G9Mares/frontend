import { TicketStatus } from '../enums/ticket-status.enum';

export interface Ticket {
  id: string;
  requester_id: string;
  area_id: string;
  subject: string;
  description: string;
  status: TicketStatus;
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
