export interface Attachment {
  id: string;
  ticket_id: string;
  file_name: string;
  content_type: string;
  file_size?: number;
  created_at: string;
  uploaded_by?: string | null;
}
