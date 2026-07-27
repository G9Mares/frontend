import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Attachment, AttachmentDownloadResponse } from '../models/attachment.model';
import { API_BASE_URL } from '../utils/api-base-url.token';

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  uploadAttachments(ticketId: string, files: File[]): Observable<Attachment[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post<Attachment[]>(`${this.apiBaseUrl}/tickets/${ticketId}/attachments`, formData);
  }

  getDownloadUrl(ticketId: string, attachmentId: string): Observable<AttachmentDownloadResponse> {
    return this.http.get<AttachmentDownloadResponse>(
      `${this.apiBaseUrl}/tickets/${ticketId}/attachments/${attachmentId}/download`,
    );
  }
}
