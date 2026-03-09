import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
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
  imports: [RouterLink, RouterLinkActive, AsyncPipe,
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
    .nav-actions { display: flex; align-items: center; gap: 4px; }
    .nav-actions mat-icon { color: #fff; }
    .btn-nav-login { color: var(--color-accent) !important; font-weight: 600; }
    .menu-user-name { font-size: 0.8rem; color: var(--color-text-muted); }
    @media (max-width: 600px) { .nav-links { display: none; } }
  `]
})
export class NavbarComponent implements OnInit {
  private store = inject(Store);
  cartCount$ = this.store.select(selectCartItemCount);
  isLoggedIn$ = this.store.select(selectIsLoggedIn);
  user$ = this.store.select(selectAuthUser);
  constructor() { }
  ngOnInit() { }
  onLogout() { this.store.dispatch(logout()); }
}
