import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Attachment } from '../models/attachment.model';

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  private readonly attachmentsByTicket = new Map<string, Attachment[]>();

  getAttachments(ticketId: string): Observable<Attachment[]> {
    return of(this.attachmentsByTicket.get(ticketId) ?? []).pipe(delay(150));
  }

  uploadAttachments(ticketId: string, files: File[]): Observable<Attachment[]> {
    const createdAt = new Date().toISOString();
    const attachments = files.map((file) => ({
      id: crypto.randomUUID(),
      ticket_id: ticketId,
      file_name: file.name,
      content_type: file.type,
      file_size: file.size,
      created_at: createdAt,
      uploaded_by: null,
    }));
    const currentAttachments = this.attachmentsByTicket.get(ticketId) ?? [];

    this.attachmentsByTicket.set(ticketId, [...currentAttachments, ...attachments]);
    return of(attachments).pipe(delay(250));
  }
}
