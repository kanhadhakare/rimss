import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Lookbook {
    _id: string;
    title: string;
    subtitle: string;
    description: string;
    coverImage: string;
    season: string;
    products: any[];
    tags: string[];
    featured: boolean;
    createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class LookbookService {
    private base = `${environment.apiUrl}/lookbooks`;
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Lookbook[]>(this.base);
    }

    getById(id: string) {
        return this.http.get<Lookbook>(`${this.base}/${id}`);
    }
}
