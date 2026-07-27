export interface AuditActor {
  id: string;
  name: string;
  email?: string;
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  performed_by: AuditActor | string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
}
