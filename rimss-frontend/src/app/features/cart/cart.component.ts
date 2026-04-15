import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Title } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { selectCartItems, selectCartTotal, selectLocalCartItems, selectLocalCartTotal, selectIsLoggedIn as selectLoginFromCart } from '../../store/cart/cart.selectors';
import { selectIsLoggedIn } from '../../store/auth/auth.selectors';
import { removeCartItem, updateCartItem, removeFromLocalCart, updateLocalCartItem } from '../../store/cart/cart.actions';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, AsyncPipe, CurrencyPipe, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  private store = inject(Store);
  isLoggedIn$ = this.store.select(selectIsLoggedIn);
  cartItems$ = this.store.select(selectCartItems);
  cartTotal$ = this.store.select(selectCartTotal);
  localItems$ = this.store.select(selectLocalCartItems);
  localTotal$ = this.store.select(selectLocalCartTotal);

  constructor(private title: Title) { }
  ngOnInit() { this.title.setTitle('Shopping Cart — YCompany'); }
  updateQty(item: any, qty: number) { this.store.dispatch(updateCartItem({ itemId: item._id, quantity: qty })); }
  removeItem(itemId: string) { this.store.dispatch(removeCartItem({ itemId })); }
  updateLocalQty(itemId: string, qty: number) { this.store.dispatch(updateLocalCartItem({ itemId, quantity: qty })); }
  removeLocalItem(itemId: string) { this.store.dispatch(removeFromLocalCart({ itemId })); }
}
