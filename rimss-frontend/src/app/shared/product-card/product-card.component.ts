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
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
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
