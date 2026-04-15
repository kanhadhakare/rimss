import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map } from 'rxjs/operators';
import { ProductService, Product } from '../../core/services/product.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { selectCartItemCount } from '../../store/cart/cart.selectors';
import { selectAuthUser, selectIsLoggedIn } from '../../store/auth/auth.selectors';
import { logout } from '../../store/auth/auth.actions';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe, FormsModule,
    MatToolbarModule, MatButtonModule, MatIconModule, MatBadgeModule, MatMenuModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);
  private productService = inject(ProductService);

  cartCount$ = this.store.select(selectCartItemCount);
  isLoggedIn$ = this.store.select(selectIsLoggedIn);
  user$ = this.store.select(selectAuthUser);
  
  searchQuery = '';
  showDropdown = false;
  private searchSubject = new Subject<string>();
  searchResults$!: Observable<Product[]>;

  constructor() { }

  ngOnInit() {
    this.searchResults$ = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.trim().length < 2) return of([]);
        return this.productService.getProducts({ search: query, limit: 5 }).pipe(
          map((res: any) => res.products),
          catchError(() => of([]))
        );
      })
    );
  }

  onSearchInput(val: string) {
    this.searchSubject.next(val);
  }

  onBlur() {
    setTimeout(() => this.showDropdown = false, 200);
  }
  
  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { search: this.searchQuery.trim() } });
      this.showDropdown = false;
      this.searchQuery = '';
      this.searchSubject.next('');
    }
  }

  goToProduct(id: string) {
    this.router.navigate(['/product', id]);
    this.showDropdown = false;
    this.searchQuery = '';
    this.searchSubject.next('');
  }

  onLogout() { this.store.dispatch(logout()); }
}
