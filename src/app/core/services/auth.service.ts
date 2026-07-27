import { Injectable, signal } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { SupportUserRole } from '../enums/support-user-role.enum';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { SupportUser } from '../models/support-user.model';

const supportAccessTokenKey = 'support_access_token';
const mockSupportToken = 'mock-support-access-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<SupportUser | null>(null);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    if (
      credentials.email.toLowerCase() !== 'support@example.com' ||
      credentials.password !== 'Support123!'
    ) {
      return throwError(() => new Error('Invalid credentials.')).pipe(delay(250));
    }

    const user = this.createMockUser();
    const response: LoginResponse = {
      access_token: mockSupportToken,
      token_type: 'bearer',
      user,
    };

    return of(response).pipe(delay(250));
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
