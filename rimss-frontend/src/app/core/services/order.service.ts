import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private base = `${environment.apiUrl}`;
    constructor(private http: HttpClient) { }

    createPaymentIntent(amount: number) {
        return this.http.post<{ clientSecret: string; mock: boolean }>(
            `${this.base}/payment/create-intent`, { amount: Math.round(amount * 100) }
        );
    }

    placeOrder(orderData: any) {
        return this.http.post<any>(`${this.base}/orders`, orderData);
    }

    getMyOrders() {
        return this.http.get<any[]>(`${this.base}/orders/me`);
    }
}
