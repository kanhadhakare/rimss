import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UserProfile, Address } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
    private base = `${environment.apiUrl}/users`;
    constructor(private http: HttpClient) { }

    getProfile() {
        return this.http.get<UserProfile>(`${this.base}/profile`);
    }

    updateProfile(data: { name?: string; password?: string; avatar?: string }) {
        return this.http.put<UserProfile>(`${this.base}/profile`, data);
    }

    addAddress(address: Partial<Address>) {
        return this.http.post<Address>(`${this.base}/addresses`, address);
    }

    updateAddress(id: string, address: Partial<Address>) {
        return this.http.put<Address>(`${this.base}/addresses/${id}`, address);
    }

    deleteAddress(id: string) {
        return this.http.delete<{ message: string }>(`${this.base}/addresses/${id}`);
    }
}
