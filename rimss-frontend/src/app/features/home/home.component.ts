import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, SlicePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Meta, Title } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { loadProducts } from '../../store/product/product.actions';
import { selectAllProducts, selectProductLoading } from '../../store/product/product.selectors';
import { Product } from '../../core/services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, AsyncPipe, SlicePipe, MatButtonModule, MatIconModule, ProductCardComponent],
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

    <!-- Featured Products Slideshow -->
    <section class="section featured-section">
      <div class="container">
        <h2 class="section-title">Featured Pieces</h2>
        <p class="section-subtitle">Handpicked selections from our latest collection</p>
        <div class="divider"></div>

        @if (loading$ | async) {
          <div class="loading-overlay"><div class="spinner"></div></div>
        } @else if ((products$ | async)?.length) {
          @if (products$ | async; as featuredProducts) {
            {{ initSlider(featuredProducts) }}
            <div class="slideshow-wrapper"
                 (mouseenter)="pauseSlider()"
                 (mouseleave)="resumeSlider()">

              <!-- Slides -->
              <div class="slides-track">
                @for (p of featuredProducts; track p._id; let i = $index) {
                  <div class="slide" [class.active]="i === currentSlide" [class.exit]="i === prevSlide">
                    <div class="slide-inner">
                      <div class="slide-image">
                        <img [src]="p.images[0]" [alt]="p.name" />
                        @if (p.discountPct > 0) {
                          <span class="slide-badge">{{ p.discountPct }}% OFF</span>
                        }
                      </div>
                      <div class="slide-content">
                        <span class="slide-category">{{ p.category }}</span>
                        <h3 class="slide-name">{{ p.name }}</h3>
                        <p class="slide-desc">{{ p.description | slice:0:120 }}...</p>
                        <div class="slide-price">
                          <span class="price-sale">&#8377;{{ p.salePrice || p.price }}</span>
                          @if (p.discountPct > 0) {
                            <span class="price-original">&#8377;{{ p.price }}</span>
                          }
                        </div>
                        <a [routerLink]="['/product', p._id]" class="btn-accent slide-cta">View Product</a>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Prev / Next Controls -->
              <button class="slide-btn slide-prev" (click)="prevSlideClick(featuredProducts.length)" aria-label="Previous">
                <mat-icon>chevron_left</mat-icon>
              </button>
              <button class="slide-btn slide-next" (click)="nextSlideClick(featuredProducts.length)" aria-label="Next">
                <mat-icon>chevron_right</mat-icon>
              </button>

              <!-- Dot Indicators -->
              <div class="slide-dots">
                @for (p of featuredProducts; track p._id; let i = $index) {
                  <button class="dot" [class.active]="i === currentSlide" (click)="goToSlide(i)"></button>
                }
              </div>

              <!-- Progress bar -->
              <div class="progress-bar" [class.paused]="paused"></div>
            </div>
          }
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

    /* ─── Slideshow ─────────────────────────── */
    .featured-section { background: var(--color-bg); }
    .slideshow-wrapper {
      position: relative; overflow: hidden;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      background: #fff;
    }
    .slides-track { position: relative; }

    /* Every slide is hidden by default */
    .slide {
      display: none;
      animation: slideIn 0.55s ease forwards;
    }
    .slide.active { display: block; }
    .slide.exit   { display: none; }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(48px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .slide-inner {
      display: grid; grid-template-columns: 1fr 1fr;
      height: 480px;
    }
    .slide-image { position: relative; overflow: hidden; background: #f0ede8; height: 100%; }
    .slide-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 6s ease; }
    .slide.active .slide-image img { transform: scale(1.05); }

    .slide-badge {
      position: absolute; top: 16px; left: 16px;
      background: var(--color-accent); color: var(--color-primary);
      font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em;
      padding: 4px 12px; border-radius: 100px;
    }
    .slide-content {
      display: flex; flex-direction: column; justify-content: center;
      padding: 40px 48px; gap: 12px;
    }
    .slide-category {
      font-size: 0.72rem; letter-spacing: 0.15em; text-transform: uppercase;
      color: var(--color-accent); font-weight: 700;
    }
    .slide-name {
      font-family: var(--font-display); font-size: clamp(1.4rem, 3vw, 2rem);
      color: var(--color-primary); line-height: 1.2; margin: 0;
    }
    .slide-desc { color: var(--color-text-muted); font-size: 0.9rem; line-height: 1.6; margin: 0; }
    .slide-price { display: flex; align-items: baseline; gap: 12px; }
    .price-sale { font-family: var(--font-display); font-size: 1.6rem; font-weight: 700; color: var(--color-primary); }
    .price-original { font-size: 1rem; color: var(--color-text-muted); text-decoration: line-through; }
    .slide-cta { display: inline-block; margin-top: 8px; align-self: flex-start; }

    /* Controls */
    .slide-btn {
      position: absolute; top: 50%; transform: translateY(-50%);
      background: rgba(255,255,255,0.9); border: none; border-radius: 50%;
      width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; z-index: 10;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      transition: background 0.2s, transform 0.2s;
    }
    .slide-btn:hover { background: #fff; transform: translateY(-50%) scale(1.1); }
    .slide-prev { left: 16px; }
    .slide-next { right: 16px; }
    .slide-btn mat-icon { color: var(--color-primary); }

    /* Dots */
    .slide-dots {
      display: flex; justify-content: center; gap: 8px; padding: 16px 0 20px;
      background: #fff;
    }
    .dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--color-border); border: none; cursor: pointer;
      transition: background 0.3s, transform 0.3s; padding: 0;
    }
    .dot.active { background: var(--color-accent); transform: scale(1.5); }

    /* Progress bar */
    .progress-bar {
      position: absolute; bottom: 0; left: 0; height: 3px;
      background: var(--color-accent); width: 100%;
      transform-origin: left;
      animation: progressBar 4s linear infinite;
    }
    .progress-bar.paused { animation-play-state: paused; }
    @keyframes progressBar {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }

    .text-center { text-align: center; }
    .mt-40 { margin-top: 40px; }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--color-border); border-top-color: var(--color-accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Values */
    .values-section { background: var(--color-primary); }
    .values-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 32px; }
    .value-card { text-align: center; color: rgba(255,255,255,.9); }
    .value-icon { font-size: 2rem; color: var(--color-accent); margin-bottom: 12px; }
    .value-card h3 { font-family: var(--font-display); font-size: 1.1rem; color: #fff; margin-bottom: 8px; }
    .value-card p { font-size: 0.85rem; color: rgba(255,255,255,.6); line-height: 1.6; }

    /* Mobile */
    @media (max-width: 768px) {
      .slide-inner { grid-template-columns: 1fr; min-height: auto; }
      .slide-image { height: 240px; }
      .slide-content { padding: 24px 20px; gap: 8px; }
      .slide-name { font-size: 1.3rem; }
      .price-sale { font-size: 1.3rem; }
      .slide-btn { width: 36px; height: 36px; }
      .slide-prev { left: 8px; }
      .slide-next { right: 8px; }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  products$ = this.store.select(selectAllProducts);
  loading$ = this.store.select(selectProductLoading);

  currentSlide = 0;
  prevSlide = -1;
  paused = false;
  private timer: any;
  private _initialized = false;

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
    this.meta.updateTag({ name: 'description', content: 'YCompany — Discover timeless luxury Indian fashion.' });
    this.store.dispatch(loadProducts({ filters: { featured: true, limit: 8 } }));
  }

  /** Called from template when async pipe resolves products — safe for change detection */
  initSlider(products: Product[]): string {
    if (products.length > 0 && !this.timer) {
      this.startTimer(products.length);
    }
    return '';
  }

  startTimer(len: number) {
    this.stopTimer();
    this.timer = setInterval(() => {
      if (!this.paused) {
        this.prevSlide = this.currentSlide;
        this.currentSlide = (this.currentSlide + 1) % len;
      }
    }, 4000);
  }

  stopTimer() {
    if (this.timer) clearInterval(this.timer);
  }

  nextSlideClick(len = 8) {
    this.prevSlide = this.currentSlide;
    this.currentSlide = (this.currentSlide + 1) % len;
  }

  prevSlideClick(len = 8) {
    this.prevSlide = this.currentSlide;
    this.currentSlide = (this.currentSlide - 1 + len) % len;
  }

  goToSlide(i: number) {
    this.prevSlide = this.currentSlide;
    this.currentSlide = i;
  }

  pauseSlider() { this.paused = true; }
  resumeSlider() { this.paused = false; }

  ngOnDestroy() {
    this.stopTimer();
  }
}
