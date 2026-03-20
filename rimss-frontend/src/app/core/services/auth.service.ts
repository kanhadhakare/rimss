import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Address {
    _id?: string;
    fullName: string;
    addressLine: string;
    city: string;
    postalCode: string;
    country: string;
    isHome: boolean;
}

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    addresses?: Address[];
}

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; password: string; }
export interface AuthResponse { token: string; user: UserProfile; }

@Injectable({ providedIn: 'root' })
export class AuthService {
    private base = `${environment.apiUrl}/auth`;
    constructor(private http: HttpClient) { }
    login(payload: LoginPayload) { return this.http.post<AuthResponse>(`${this.base}/login`, payload); }
    register(payload: RegisterPayload) { return this.http.post<AuthResponse>(`${this.base}/register`, payload); }
}
