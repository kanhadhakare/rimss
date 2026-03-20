import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Meta, Title } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { loadProducts } from '../../store/product/product.actions';
import { selectAllProducts, selectProductLoading } from '../../store/product/product.selectors';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, AsyncPipe, MatButtonModule, MatIconModule, ProductCardComponent],
  template: `
    <!-- Hero -->
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content container">
        <span class="hero-label">New Season 2024</span>
        <h1 class="hero-title">Timeless Luxury.<br>Modern Heritage.</h1>
        <p class="hero-sub">Discover the finest Indian ethical fashion — reimagined for the contemporary wardrobe.</p>
        <div class="hero-actions">
          <a routerLink="/products" class="btn-accent">Shop Collection</a>
          <a routerLink="/products?featured=true" class="btn-outline">View Lookbook</a>
        </div>
      </div>
    </section>

    <!-- Offer Banner -->
    <section class="offer-banner">
      <div class="container offer-inner">
        <mat-icon>local_offer</mat-icon>
        <span>Free shipping on all orders over ₹2000 · Use code <strong>HERITAGE20</strong> for 20% off your first order</span>
      </div>
    </section>

    <!-- Categories -->
    <section class="section categories-section">
      <div class="container">
        <h2 class="section-title">Shop by Category</h2>
        <div class="divider"></div>
        <div class="categories-grid">
          @for (cat of categories; track cat.key) {
            <a [routerLink]="['/products']" [queryParams]="{category: cat.key}" class="cat-card card">
              <div class="cat-img-wrap">
                <img [src]="cat.image" [alt]="cat.label" loading="lazy" />
              </div>
              <div class="cat-label">{{ cat.label }}</div>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="section featured-section">
      <div class="container">
        <h2 class="section-title">Featured Pieces</h2>
        <p class="section-subtitle">Handpicked selections from our latest collection</p>
        <div class="divider"></div>
        @if (loading$ | async) {
          <div class="loading-overlay">
            <div class="spinner"></div>
          </div>
        } @else {
          <div class="products-grid">
            @for (p of products$ | async; track p._id) {
              <app-product-card [product]="p"></app-product-card>
            }
          </div>
        }
        <div class="text-center mt-40">
          <a routerLink="/products" class="btn-primary">View All Collections</a>
        </div>
      </div>
    </section>

    <!-- Value Props -->
    <section class="section values-section">
      <div class="container values-grid">
        @for (v of values; track v.icon) {
          <div class="value-card">
            <mat-icon class="value-icon">{{ v.icon }}</mat-icon>
            <h3>{{ v.title }}</h3>
            <p>{{ v.desc }}</p>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    /* Hero */
    .hero {
      position: relative; min-height: 85vh; display: flex; align-items: center;
      background: url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600') center/cover no-repeat;
    }
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(26,26,46,.82) 0%, rgba(26,26,46,.4) 100%);
    }
    .hero-content { position: relative; z-index: 1; max-width: 640px; }
    .hero-label { font-size: 0.75rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--color-accent); font-weight: 600; }
    .hero-title { font-family: var(--font-display); font-size: clamp(2.8rem, 6vw, 5rem); color: #fff; line-height: 1.1; margin: 16px 0 20px; }
    .hero-sub { color: rgba(255,255,255,.8); font-size: 1.05rem; line-height: 1.7; margin-bottom: 36px; }
    .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
    /* Offer Banner */
    .offer-banner { background: var(--color-accent); padding: 12px 0; }
    .offer-inner { display: flex; align-items: center; gap: 10px; color: var(--color-primary); font-size: 0.88rem; font-weight: 500; }
    .offer-inner mat-icon { font-size: 1rem; }
    /* Categories */
    .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 20px; }
    .cat-card { cursor: pointer; text-decoration: none; }
    .cat-img-wrap { aspect-ratio: 1; overflow: hidden; background: #f0ede8; }
    .cat-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .cat-card:hover .cat-img-wrap img { transform: scale(1.08); }
    .cat-label { padding: 12px; font-family: var(--font-display); font-size: 1rem; font-weight: 600; color: var(--color-primary); text-align: center; text-transform: capitalize; }
    /* Featured */
    .featured-section { background: var(--color-bg); }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; }
    .text-center { text-align: center; }
    .mt-40 { margin-top: 40px; }
    /* Spinner */
    .spinner { width: 40px; height: 40px; border: 3px solid var(--color-border); border-top-color: var(--color-accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); }}
    /* Values */
    .values-section { background: var(--color-primary); }
    .values-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 32px; }
    .value-card { text-align: center; color: rgba(255,255,255,.9); }
    .value-icon { font-size: 2rem; color: var(--color-accent); margin-bottom: 12px; }
    .value-card h3 { font-family: var(--font-display); font-size: 1.1rem; color: #fff; margin-bottom: 8px; }
    .value-card p { font-size: 0.85rem; color: rgba(255,255,255,.6); line-height: 1.6; }
  `]
})
export class HomeComponent implements OnInit {
  private store = inject(Store);
  products$ = this.store.select(selectAllProducts);
  loading$ = this.store.select(selectProductLoading);

  categories = [
    { key: 'sweaters', label: 'Sweaters', image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400' },
    { key: 'shirts', label: 'Shirts', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400' },
    { key: 'jackets', label: 'Jackets', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400' },
    { key: 'shoes', label: 'Shoes', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400' },
    { key: 'accessories', label: 'Accessories', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400' },
  ];

  values = [
    { icon: 'local_shipping', title: 'Free Pan-India Shipping', desc: 'Complimentary delivery on all orders over ₹2000 across India.' },
    { icon: 'workspace_premium', title: 'Premium Craftsmanship', desc: 'Every garment is crafted with the finest Indian materials and expert tailoring.' },
    { icon: 'loop', title: 'Easy Returns', desc: 'Not satisfied? Return any item within 30 days, no questions asked.' },
    { icon: 'support_agent', title: 'Concierge Service', desc: 'Our dedicated style advisors are available 7 days a week to assist you.' },
  ];

  constructor(private title: Title, private meta: Meta) { }

  ngOnInit() {
    this.title.setTitle('YCompany — Luxury Indian Fashion');
    this.meta.updateTag({ name: 'description', content: 'YCompany — Discover timeless luxury Indian fashion. Sweaters, shirts, shoes, jackets and accessories for men, women and children.' });
    this.store.dispatch(loadProducts({ filters: { featured: true, limit: 8 } }));
  }
}
