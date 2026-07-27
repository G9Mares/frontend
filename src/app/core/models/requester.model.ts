export interface Requester {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  last_update_at: string;
  last_update_acc: string;
}

export interface CreateRequesterRequest {
  name: string;
  email: string;
  phone: string;
}
