import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Meta, Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { loadProducts } from '../../store/product/product.actions';
import { selectAllProducts, selectProductLoading, selectProductTotal } from '../../store/product/product.selectors';
import { ProductFilter } from '../../core/services/product.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [AsyncPipe, FormsModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatSelectModule, MatSliderModule, MatCheckboxModule, MatChipsModule,
    ProductCardComponent],
  template: `
    <div class="catalog-layout">
      <!-- Sidebar Filters -->
      <aside class="sidebar">
        <h2 class="sidebar-title">Filter</h2>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Search</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [(ngModel)]="filters.search" (ngModelChange)="onSearchChange($event)" placeholder="Search products..." />
        </mat-form-field>

        <div class="filter-group">
          <label class="filter-label">Category</label>
          <div class="chip-group">
            @for (c of categories; track c) {
              <span class="filter-chip" [class.active]="filters.category === c"
                    (click)="setCategory(c)">{{ c }}</span>
            }
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Gender</label>
          <div class="chip-group">
            @for (g of genders; track g) {
              <span class="filter-chip" [class.active]="filters.gender === g"
                    (click)="setGender(g)">{{ g }}</span>
            }
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Max Price: ₹{{ filters.maxPrice || 5000 }}</label>
          <input type="range" min="500" max="5000" step="500"
                 [(ngModel)]="filters.maxPrice" (change)="applyFilters()" class="price-slider" />
        </div>

        <div class="filter-group">
          <label class="filter-check">
            <input type="checkbox" [(ngModel)]="filters.discount" (change)="applyFilters()" />
            <span>On Sale Only</span>
          </label>
        </div>

        <button class="btn-outline" (click)="resetFilters()">Reset Filters</button>
      </aside>

      <!-- Product Grid -->
      <main class="catalog-main">
        <div class="catalog-header">
          <h1 class="catalog-title">Collections</h1>
          <span class="catalog-count">{{ (total$ | async) || 0 }} products</span>
        </div>

        @if (loading$ | async) {
          <div class="loading-overlay">
            <div class="spinner"></div>
          </div>
        } @else if ((products$ | async)?.length === 0) {
          <div class="empty-state">
            <mat-icon>search_off</mat-icon>
            <p>No products match your filters.</p>
            <button class="btn-primary" (click)="resetFilters()">Clear Filters</button>
          </div>
        } @else {
          <div class="products-grid">
            @for (p of products$ | async; track p._id) {
              <app-product-card [product]="p"></app-product-card>
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .catalog-layout { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }
    .sidebar { padding: 32px 24px; background: #fff; border-right: 1px solid var(--color-border); position: sticky; top: 64px; height: calc(100vh - 64px); overflow-y: auto; }
    .sidebar-title { font-family: var(--font-display); font-size: 1.4rem; color: var(--color-primary); margin-bottom: 24px; }
    .filter-group { margin-bottom: 24px; }
    .filter-label { display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-muted); margin-bottom: 10px; font-weight: 600; }
    .chip-group { display: flex; flex-wrap: wrap; gap: 8px; }
    .filter-chip { padding: 5px 14px; border: 1.5px solid var(--color-border); border-radius: 100px; font-size: 0.8rem; cursor: pointer; text-transform: capitalize; transition: all var(--transition); }
    .filter-chip.active, .filter-chip:hover { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
    .price-slider { width: 100%; accent-color: var(--color-accent); }
    .filter-check { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer; }
    input[type=checkbox] { accent-color: var(--color-accent); width: 16px; height: 16px; }
    .w-full { width: 100%; }
    .catalog-main { padding: 32px; background: var(--color-bg); }
    .catalog-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 28px; }
    .catalog-title { font-family: var(--font-display); font-size: 2rem; color: var(--color-primary); }
    .catalog-count { font-size: 0.85rem; color: var(--color-text-muted); }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; }
    .empty-state { text-align: center; padding: 64px; }
    .empty-state mat-icon { font-size: 3rem; color: var(--color-border); }
    .empty-state p { color: var(--color-text-muted); margin: 16px 0; }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--color-border); border-top-color: var(--color-accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 60px auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 768px) { .catalog-layout { grid-template-columns: 1fr; } .sidebar { position: static; height: auto; border-right: none; border-bottom: 1px solid var(--color-border); } }
  `]
})
export class CatalogComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  products$ = this.store.select(selectAllProducts);
  loading$ = this.store.select(selectProductLoading);
  total$ = this.store.select(selectProductTotal);
  private destroy$ = new Subject<void>();
  private searchChange$ = new Subject<string>();

  filters: ProductFilter = { page: 1, limit: 12 };
  categories = ['sweaters', 'shirts', 'jackets', 'shoes', 'accessories', 'trousers'];
  genders = ['men', 'women', 'children', 'unisex'];

  constructor(private route: ActivatedRoute, private title: Title, private meta: Meta) { }

  ngOnInit() {
    this.title.setTitle('Collections — YCompany');
    this.meta.updateTag({ name: 'description', content: 'Browse the full YCompany collection — sweaters, shirts, jackets, shoes and accessories.' });
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(p => {
      if (p['category']) this.filters.category = p['category'];
      if (p['featured']) this.filters.featured = true;
      this.applyFilters();
    });
    this.searchChange$.pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
  }

  onSearchChange(val: string) { this.searchChange$.next(val); }
  setCategory(cat: string) { this.filters.category = this.filters.category === cat ? undefined : cat; this.applyFilters(); }
  setGender(g: string) { this.filters.gender = this.filters.gender === g ? undefined : g; this.applyFilters(); }
  applyFilters() { this.store.dispatch(loadProducts({ filters: { ...this.filters } })); }
  resetFilters() { this.filters = { page: 1, limit: 12 }; this.applyFilters(); }
  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}
