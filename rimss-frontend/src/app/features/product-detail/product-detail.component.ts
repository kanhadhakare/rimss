import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Meta, Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { loadProduct, clearSelected } from '../../store/product/product.actions';
import { selectSelectedProduct, selectProductLoading } from '../../store/product/product.selectors';
import { selectIsLoggedIn } from '../../store/auth/auth.selectors';
import { addToCart, addToLocalCart } from '../../store/cart/cart.actions';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, FormsModule, RouterLink,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatSelectModule, MatFormFieldModule],
  template: `
    @if (loading$ | async) {
      <div class="loading-overlay" style="min-height:80vh"><div class="spinner"></div></div>
    } @else if (product$ | async; as p) {
      <div class="detail-wrap container">
        <!-- Breadcrumbs -->
        <nav class="breadcrumb">
          <a routerLink="/">Home</a> /
          <a routerLink="/products">Collections</a> /
          <span>{{ p.name }}</span>
        </nav>

        <div class="detail-grid">
          <!-- Images -->
          <div class="gallery">
            <div class="main-img-wrap">
              <img [src]="p.images[activeImg]" [alt]="p.name" class="main-img" />
              @if (p.discountPct > 0) {
                <span class="badge badge-discount">−{{ p.discountPct }}%</span>
              }
            </div>
            <div class="thumbnails">
              @for (img of p.images; track img; let i = $index) {
                <img [src]="img" [alt]="p.name + ' ' + i" (click)="activeImg = i"
                     [class.active-thumb]="activeImg === i" class="thumb" />
              }
            </div>
          </div>

          <!-- Info -->
          <div class="info-panel">
            <span class="info-category">{{ p.category }} · {{ p.gender }}</span>
            <h1 class="info-name">{{ p.name }}</h1>
            <div class="info-rating">
              <mat-icon class="star">star</mat-icon>
              <span>{{ p.rating }} ({{ p.reviewCount }} reviews)</span>
            </div>
            <div class="info-pricing">
              @if (p.discountPct > 0) {
                <span class="price-sale">{{ p.salePrice | currency:'INR' }}</span>
                <span class="price-original">{{ p.price | currency:'INR' }}</span>
                <span class="price-saved">Save {{ p.price - p.salePrice | currency:'INR' }}</span>
              } @else {
                <span class="price-sale">{{ p.price | currency:'INR' }}</span>
              }
            </div>
            <p class="info-desc">{{ p.description }}</p>

            <!-- Colors -->
            @if (p.colors?.length) {
              <div class="option-group">
                <label class="option-label">Color: <strong>{{ selectedColor || 'Select' }}</strong></label>
                <div class="color-chips">
                  @for (c of p.colors; track c) {
                    <span class="color-chip" [class.active]="selectedColor === c" (click)="selectedColor = c">{{ c }}</span>
                  }
                </div>
              </div>
            }

            <!-- Sizes -->
            @if (p.sizes?.length) {
              <div class="option-group">
                <label class="option-label">Size: <strong>{{ selectedSize || 'Select' }}</strong></label>
                <div class="size-chips">
                  @for (s of p.sizes; track s) {
                    <span class="size-chip" [class.active]="selectedSize === s" (click)="selectedSize = s">{{ s }}</span>
                  }
                </div>
              </div>
            }

            <!-- Add to Cart -->
            <button class="btn-primary add-cart-btn" (click)="addToCart(p)" [disabled]="p.stock === 0">
              <mat-icon>shopping_bag</mat-icon>
              {{ p.stock > 0 ? 'Add to Cart' : 'Out of Stock' }}
            </button>

            <div class="stock-info">
              @if (p.stock > 0 && p.stock < 10) {
                <span class="low-stock">⚠ Only {{ p.stock }} left in stock</span>
              } @else if (p.stock > 0) {
                <span class="in-stock">✓ In Stock</span>
              }
            </div>

            <!-- Meta -->
              <span>Free shipping over ₹2000</span> ·
              <span>30-day returns</span> ·
              <span>Authenticity guaranteed</span>
            </div>
          </div>
        </div>
    }
  `,
  styles: [`
    .detail-wrap { padding: 32px 24px 64px; }
    .breadcrumb { font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 28px; }
    .breadcrumb a { color: var(--color-text-muted); }
    .breadcrumb a:hover { color: var(--color-accent-dark); }
    .breadcrumb span { color: var(--color-primary); }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
    /* Gallery */
    .main-img-wrap { position: relative; aspect-ratio: 3/4; background: #f0ede8; border-radius: var(--radius-md); overflow: hidden; }
    .main-img { width: 100%; height: 100%; object-fit: cover; }
    .badge { position: absolute; top: 12px; left: 12px; }
    .thumbnails { display: flex; gap: 8px; margin-top: 12px; overflow-x: auto; }
    .thumb { width: 72px; height: 96px; object-fit: cover; border-radius: var(--radius-sm); cursor: pointer; border: 2px solid transparent; transition: border-color var(--transition); }
    .active-thumb { border-color: var(--color-accent); }
    /* Info */
    .info-category { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-muted); }
    .info-name { font-family: var(--font-display); font-size: 2.2rem; color: var(--color-primary); margin: 8px 0 12px; line-height: 1.2; }
    .info-rating { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 16px; }
    .star { font-size: 1.1rem; color: var(--color-accent); vertical-align: middle; }
    .info-pricing { display: flex; gap: 12px; align-items: baseline; margin-bottom: 20px; }
    .price-sale { font-size: 1.6rem; font-weight: 600; color: var(--color-primary); }
    .price-original { font-size: 1rem; color: var(--color-text-muted); text-decoration: line-through; }
    .price-saved { font-size: 0.85rem; color: var(--color-success); font-weight: 600; }
    .info-desc { color: var(--color-text-muted); line-height: 1.8; margin-bottom: 24px; font-size: 0.95rem; }
    .option-group { margin-bottom: 20px; }
    .option-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); display: block; margin-bottom: 10px; }
    .color-chips, .size-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .color-chip, .size-chip { padding: 6px 16px; border: 1.5px solid var(--color-border); border-radius: 100px; font-size: 0.85rem; cursor: pointer; transition: all var(--transition); }
    .color-chip.active, .size-chip.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
    .add-cart-btn { width: 100%; justify-content: center; padding: 16px; font-size: 0.95rem; margin: 20px 0 8px; }
    .add-cart-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .stock-info { font-size: 0.82rem; margin-bottom: 20px; }
    .in-stock { color: var(--color-success); }
    .low-stock { color: #e67e22; }
    .info-meta { font-size: 0.78rem; color: var(--color-text-muted); border-top: 1px solid var(--color-border); padding-top: 16px; }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--color-border); border-top-color: var(--color-accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin: auto; }
    @keyframes spin { to { transform: rotate(360deg); }}
    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } }
  `]
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  product$ = this.store.select(selectSelectedProduct);
  loading$ = this.store.select(selectProductLoading);
  private destroy$ = new Subject<void>();
  activeImg = 0;
  selectedColor = '';
  selectedSize = '';

  constructor(private route: ActivatedRoute,
    private snackBar: MatSnackBar, private title: Title, private meta: Meta) { }

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(p => {
      this.store.dispatch(loadProduct({ id: p['id'] }));
    });
    this.product$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((p: any) => {
      this.title.setTitle(`${p.name} — YCompany`);
      this.meta.updateTag({ name: 'description', content: p.description });
    });
  }

  addToCart(p: any) {
    this.store.select(selectIsLoggedIn).pipe(takeUntil(this.destroy$)).subscribe(loggedIn => {
      if (loggedIn) {
        this.store.dispatch(addToCart({ productId: p._id, quantity: 1, size: this.selectedSize, color: this.selectedColor }));
      } else {
        this.store.dispatch(addToLocalCart({ product: p, quantity: 1, size: this.selectedSize, color: this.selectedColor }));
      }
      this.snackBar.open('Added to cart!', 'View Cart', { duration: 3000 });
    }).unsubscribe();
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); this.store.dispatch(clearSelected()); }
}
