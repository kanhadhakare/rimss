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
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
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
      this.snackBar.open('Added to cart!', 'View Cart', { duration: 3000, panelClass: ['app-snackbar'] });
    }).unsubscribe();
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); this.store.dispatch(clearSelected()); }
}
