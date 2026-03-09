import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Product {
    _id: string; name: string; description: string;
    category: string; gender: string;
    price: number; discountPct: number; salePrice: number;
    colors: string[]; sizes: string[]; images: string[];
    stock: number; featured: boolean; rating: number; reviewCount: number;
}

export interface ProductsResponse {
    products: Product[]; total: number; page: number; pages: number;
}

export interface ProductFilter {
    search?: string; category?: string; gender?: string;
    minPrice?: number; maxPrice?: number;
    color?: string; discount?: boolean; featured?: boolean;
    page?: number; limit?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
    private base = `${environment.apiUrl}/products`;
    constructor(private http: HttpClient) { }

    getProducts(filters: ProductFilter = {}) {
        let params = new HttpParams();
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
        });
        return this.http.get<ProductsResponse>(this.base, { params });
    }

    getProduct(id: string) { return this.http.get<Product>(`${this.base}/${id}`); }
}
