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
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
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
