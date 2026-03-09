import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface CartItem {
    _id: string;
    product: any;
    quantity: number;
    size: string;
    color: string;
}

export interface Cart {
    _id?: string;
    items: CartItem[];
    total?: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
    private base = `${environment.apiUrl}/cart`;
    constructor(private http: HttpClient) { }

    getCart() { return this.http.get<Cart>(this.base); }
    addItem(productId: string, quantity = 1, size = '', color = '') {
        return this.http.post<Cart>(this.base, { productId, quantity, size, color });
    }
    updateItem(itemId: string, quantity: number) {
        return this.http.put<Cart>(`${this.base}/${itemId}`, { quantity });
    }
    removeItem(itemId: string) { return this.http.delete<Cart>(`${this.base}/${itemId}`); }
    clearCart() { return this.http.delete<any>(this.base); }
}
