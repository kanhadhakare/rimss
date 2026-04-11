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
  template: `
    <mat-toolbar class="navbar">
      <div class="nav-inner container">
        <a routerLink="/" class="brand">
          <span class="brand-y">Y</span><span class="brand-co">Company</span>
        </a>

        <nav class="nav-links">
          <a mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
          <a mat-button routerLink="/products" routerLinkActive="active">Collections</a>
        </nav>

        <div class="search-container">
          <form class="nav-search" (ngSubmit)="onSearch()">
            <mat-icon>search</mat-icon>
            <input type="text" name="search" [(ngModel)]="searchQuery" 
                   (ngModelChange)="onSearchInput($event)"
                   (focus)="showDropdown = true"
                   (blur)="onBlur()"
                   placeholder="Search..." autocomplete="off" />
          </form>

          @if (showDropdown && (searchResults$ | async); as results) {
            <div class="search-dropdown" (mousedown)="$event.preventDefault()">
              @if (results.length > 0) {
                @for (prod of results; track prod._id) {
                  <div class="search-item" (click)="goToProduct(prod._id)">
                    <img [src]="prod.images[0]" alt="">
                    <div class="item-info">
                      <div class="item-name">{{ prod.name }}</div>
                      <div class="item-price">₹{{ prod.salePrice || prod.price }}</div>
                    </div>
                  </div>
                }
              } @else if (searchQuery.length > 2) {
                <div class="search-empty">No products found</div>
              }
            </div>
          }
        </div>


        <div class="nav-actions">
          <a mat-icon-button routerLink="/cart" aria-label="Shopping Cart"
             [matBadge]="(cartCount$ | async) || 0"
             matBadgeColor="warn"
             [matBadgeHidden]="(cartCount$ | async) === 0">
            <mat-icon>shopping_bag</mat-icon>
          </a>

          @if (isLoggedIn$ | async) {
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <div class="menu-user-name" mat-menu-item disabled>
                {{ (user$ | async)?.name }}
              </div>
              <a mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon> My Profile
              </a>
              <button mat-menu-item (click)="onLogout()">
                <mat-icon>logout</mat-icon> Sign Out
              </button>
            </mat-menu>
          } @else {
            <a mat-button routerLink="/auth/login" class="btn-nav-login">Sign In</a>
          }
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      background: var(--color-primary);
      color: #fff;
      position: sticky; top: 0; z-index: 1000;
      box-shadow: 0 2px 8px rgba(0,0,0,.3);
      padding: 0;
      height: 64px;
    }
    .nav-inner {
      display: flex; align-items: center; justify-content: space-between;
      width: 100%; height: 100%;
    }
    .brand {
      font-family: var(--font-display);
      font-size: 1.5rem; font-weight: 700;
      color: #fff; text-decoration: none; letter-spacing: 0.04em;
    }
    .brand-y { color: var(--color-accent); }
    .brand-co { font-weight: 300; }
    .nav-links { display: flex; gap: 4px; }
    .nav-links a { color: rgba(255,255,255,.8); font-size: 0.875rem; letter-spacing: 0.06em; text-transform: uppercase; }
    .nav-links a.active, .nav-links a:hover { color: var(--color-accent); }
    .search-container { position: relative; display: flex; align-items: center; margin: 0 16px; }
    .nav-search { display: flex; align-items: center; background: rgba(255,255,255,0.15); border-radius: 20px; padding: 0 12px; height: 36px; transition: all 0.3s ease; }
    .nav-search:focus-within { background: rgba(255,255,255,0.3); }
    .nav-search mat-icon { color: white; font-size: 1.2rem; width: 1.2rem; height: 1.2rem; margin-right: 6px; }
    .nav-search input { background: transparent; border: none; color: white; outline: none; width: 120px; font-size: 0.9rem; transition: width 0.3s ease; }
    .nav-search input::placeholder { color: rgba(255,255,255,0.7); }
    .nav-search input:focus { width: 220px; }
    
    .search-dropdown {
      position: absolute; top: 100%; left: 0; right: 0; margin-top: 8px;
      background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-height: 400px; overflow-y: auto; z-index: 1050; color: var(--color-primary);
    }
    .search-item {
      display: flex; gap: 12px; padding: 12px; cursor: pointer; border-bottom: 1px solid var(--color-border);
      transition: background 0.2s;
    }
    .search-item:last-child { border-bottom: none; }
    .search-item:hover { background: var(--color-bg); }
    .search-item img { width: 40px; height: 40px; object-fit: cover; border-radius: 4px; }
    .item-info { display: flex; flex-direction: column; justify-content: center; }
    .item-name { font-weight: 600; font-size: 0.85rem; line-height: 1.2; color: var(--color-primary); }
    .item-price { font-size: 0.8rem; color: var(--color-accent); font-weight: 700; margin-top: 4px; }
    .search-empty { padding: 16px; text-align: center; color: var(--color-text-muted); font-size: 0.9rem; }
    .nav-actions { display: flex; align-items: center; gap: 4px; }
    .nav-actions mat-icon { color: #fff; }
    .btn-nav-login { color: var(--color-accent) !important; font-weight: 600; }
    .menu-user-name { font-size: 0.8rem; color: var(--color-text-muted); }
    @media (max-width: 768px) { 
      .nav-links { display: none; } 
      .search-container { margin: 0 8px; flex: 1; min-width: 0; }
      .brand-co { display: none; } /* Show only "Y" on smaller screens to save space */
      .nav-search { margin: 0; width: 100%; padding: 0 8px; }
      .nav-search input { width: 100%; min-width: 0; }
      .nav-search input:focus { width: 100%; }
      .nav-actions { gap: 0; }
    }
  `]
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
