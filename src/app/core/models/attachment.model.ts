import { TicketStatus } from '../enums/ticket-status.enum';

export interface AttachmentTicketSummary {
  id: string;
  subject: string;
  status: TicketStatus;
}

export interface Attachment {
  id: string;
  ticket_id: string;
  ticket: AttachmentTicketSummary;
  media_type: string;
  size_bytes: number;
  created_at: string;
  last_update_at: string;
  last_update_acc: string;
}

export interface AttachmentDownloadResponse {
  attachment_id: string;
  url: string;
  expires_at: string;
}
