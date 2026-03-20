import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Store } from '@ngrx/store';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../core/services/product.service';
import { addToCart } from '../../store/cart/cart.actions';
import { addToLocalCart } from '../../store/cart/cart.actions';
import { selectIsLoggedIn } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, MatIconModule, MatButtonModule, MatChipsModule],
  template: `
    <div class="card product-card">
      <a [routerLink]="['/product', product._id]" class="card-image-wrap">
        <img [src]="product.images[0]" [alt]="product.name" loading="lazy" class="card-img" />
        @if (product.discountPct > 0) {
          <span class="badge badge-discount discount-chip">−{{ product.discountPct }}%</span>
        }
      </a>
      <div class="card-body">
        <span class="card-category">{{ product.category }}</span>
        <a [routerLink]="['/product', product._id]" class="card-title">{{ product.name }}</a>
        <div class="card-pricing">
          @if (product.discountPct > 0) {
            <span class="price-sale">{{ product.salePrice | currency:'INR' }}</span>
            <span class="price-original">{{ product.price | currency:'INR' }}</span>
          } @else {
            <span class="price-sale">{{ product.price | currency:'INR' }}</span>
          }
        </div>
        <div class="card-footer">
          <div class="rating">
            <mat-icon class="star">star</mat-icon>
            <span>{{ product.rating }} ({{ product.reviewCount }})</span>
          </div>
          <button mat-mini-fab color="primary" class="add-btn"
                  (click)="onAddToCart($event)"
                  aria-label="Add to cart">
            <mat-icon>add_shopping_cart</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card { border-radius: var(--radius-md); overflow: hidden; }
    .card-image-wrap { display: block; position: relative; overflow: hidden; aspect-ratio: 3/4; background: #f0ede8; }
    .card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
    .product-card:hover .card-img { transform: scale(1.06); }
    .discount-chip { position: absolute; top: 10px; left: 10px; }
    .card-body { padding: 16px; }
    .card-category { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-muted); }
    .card-title { display: block; font-family: var(--font-display); font-size: 1.05rem; font-weight: 600; color: var(--color-primary); margin: 4px 0 8px; line-height: 1.3; }
    .card-title:hover { color: var(--color-accent-dark); }
    .card-pricing { display: flex; gap: 8px; align-items: baseline; margin-bottom: 12px; }
    .price-sale { font-size: 1rem; font-weight: 600; color: var(--color-primary); }
    .price-original { font-size: 0.85rem; color: var(--color-text-muted); text-decoration: line-through; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; }
    .rating { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; color: var(--color-text-muted); }
    .rating .star { font-size: 1rem; color: var(--color-accent); vertical-align: middle; }
    .add-btn { width: 36px; height: 36px; line-height: 36px; }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
  private store = inject(Store);
  isLoggedIn$ = this.store.select(selectIsLoggedIn);

  onAddToCart(e: Event) {
    e.preventDefault();
    this.isLoggedIn$.subscribe(loggedIn => {
      if (loggedIn) {
        this.store.dispatch(addToCart({ productId: this.product._id, quantity: 1, size: '', color: '' }));
      } else {
        this.store.dispatch(addToLocalCart({ product: this.product, quantity: 1, size: '', color: '' }));
      }
    }).unsubscribe();
  }
}
