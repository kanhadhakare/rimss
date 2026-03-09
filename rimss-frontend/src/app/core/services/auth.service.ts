import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; password: string; }
export interface AuthResponse { token: string; user: any; }

@Injectable({ providedIn: 'root' })
export class AuthService {
    private base = `${environment.apiUrl}/auth`;
    constructor(private http: HttpClient) { }
    login(payload: LoginPayload) { return this.http.post<AuthResponse>(`${this.base}/login`, payload); }
    register(payload: RegisterPayload) { return this.http.post<AuthResponse>(`${this.base}/register`, payload); }
}
