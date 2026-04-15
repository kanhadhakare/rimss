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
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
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
      if (p['search']) {
        this.filters.search = p['search'];
        setTimeout(() => this.searchChange$.next(p['search']), 0);
      }
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
