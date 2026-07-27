import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { SupportUserRole } from '../enums/support-user-role.enum';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { SupportUser } from '../models/support-user.model';
import { API_BASE_URL } from '../utils/api-base-url.token';

const supportAccessTokenKey = 'support_access_token';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  readonly currentUser = signal<SupportUser | null>(null);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiBaseUrl}/auth/login`, credentials);
  }

  getMe(): Observable<SupportUser> {
    return this.http.get<SupportUser>(`${this.apiBaseUrl}/auth/me`);
  }

  restoreSession(): Observable<SupportUser> {
    return this.getMe().pipe(tap((user) => this.currentUser.set(user)));
  }

  persistSession(response: LoginResponse): void {
    localStorage.setItem(supportAccessTokenKey, response.access_token);
    this.currentUser.set(response.user);
  }

  hasStoredToken(): boolean {
    return localStorage.getItem(supportAccessTokenKey) !== null;
  }

  clearSession(): void {
    localStorage.removeItem(supportAccessTokenKey);
    this.currentUser.set(null);
  }

  getCurrentMockUser(): SupportUser {
    return this.currentUser() ?? this.createMockUser();
  }

  private createMockUser(): SupportUser {
    const timestamp = new Date().toISOString();

    return {
      id: 'mock-support-user-id',
      name: 'Support User',
      email: 'support@example.com',
      phone: '+1 555 0100',
      role: SupportUserRole.SUPPORT,
      is_active: true,
      created_at: timestamp,
      last_update_at: timestamp,
      last_update_acc: 'mock-system',
    };
  }
}
