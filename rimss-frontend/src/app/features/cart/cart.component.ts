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
  template: `
    <div class="container section">
      <h1 class="section-title">Shopping Cart</h1>
      <div class="divider"></div>

      @if ((isLoggedIn$ | async) && (cartItems$ | async)?.length) {
        <div class="cart-layout">
          <div class="cart-items">
            @for (item of cartItems$ | async; track item._id) {
              <div class="cart-row">
                <img [src]="item.product.images[0]" [alt]="item.product.name" class="cart-img" />
                <div class="cart-info">
                  <a [routerLink]="['/product', item.product._id]" class="cart-name">{{ item.product.name }}</a>
                  @if (item.size) { <span class="cart-meta">Size: {{ item.size }}</span> }
                  @if (item.color) { <span class="cart-meta">Color: {{ item.color }}</span> }
                  <span class="cart-price">{{ item.product.salePrice | currency:'INR' }}</span>
                </div>
                <div class="qty-control">
                  <button mat-icon-button (click)="updateQty(item, item.quantity - 1)"><mat-icon>remove</mat-icon></button>
                  <span class="qty">{{ item.quantity }}</span>
                  <button mat-icon-button (click)="updateQty(item, item.quantity + 1)"><mat-icon>add</mat-icon></button>
                </div>
                <span class="cart-subtotal">{{ item.product.salePrice * item.quantity | currency:'INR' }}</span>
                <button mat-icon-button color="warn" (click)="removeItem(item._id)"><mat-icon>delete_outline</mat-icon></button>
              </div>
            }
          </div>
          <div class="cart-summary">
            <h2 class="summary-title">Order Summary</h2>
            <mat-divider></mat-divider>
            <div class="summary-row"><span>Subtotal</span><span>{{ cartTotal$ | async | currency:'INR' }}</span></div>
            <div class="summary-row"><span>Shipping</span><span>Free</span></div>
            <mat-divider></mat-divider>
            <div class="summary-row total"><span>Total</span><span>{{ cartTotal$ | async | currency:'INR' }}</span></div>
            <a routerLink="/checkout" class="btn-primary checkout-btn">Proceed to Checkout</a>
          </div>
        </div>
      } @else if ((localItems$ | async)?.length) {
        <!-- Guest Cart -->
        <div class="cart-layout">
          <div class="cart-items">
            @for (item of localItems$ | async; track item.id) {
              <div class="cart-row">
                <img [src]="item.product.images[0]" [alt]="item.product.name" class="cart-img" />
                <div class="cart-info">
                  <a [routerLink]="['/product', item.product._id]" class="cart-name">{{ item.product.name }}</a>
                  <span class="cart-price">{{ (item.product.salePrice ?? item.product.price) | currency:'INR' }}</span>
                </div>
                <div class="qty-control">
                  <button mat-icon-button (click)="updateLocalQty(item.id, item.quantity - 1)"><mat-icon>remove</mat-icon></button>
                  <span class="qty">{{ item.quantity }}</span>
                  <button mat-icon-button (click)="updateLocalQty(item.id, item.quantity + 1)"><mat-icon>add</mat-icon></button>
                </div>
                <span class="cart-subtotal">{{ (item.product.salePrice ?? item.product.price) * item.quantity | currency:'INR' }}</span>
                <button mat-icon-button color="warn" (click)="removeLocalItem(item.id)"><mat-icon>delete_outline</mat-icon></button>
              </div>
            }
          </div>
          <div class="cart-summary">
            <h2 class="summary-title">Order Summary</h2>
            <mat-divider></mat-divider>
            <div class="summary-row"><span>Subtotal</span><span>{{ localTotal$ | async | currency:'INR' }}</span></div>
            <div class="summary-row"><span>Shipping</span><span>Free</span></div>
            <mat-divider></mat-divider>
            <div class="summary-row total"><span>Total</span><span>{{ localTotal$ | async | currency:'INR' }}</span></div>
            <a routerLink="/auth/login" class="btn-primary checkout-btn">Sign In to Checkout</a>
          </div>
        </div>
      } @else {
        <div class="empty-cart">
          <mat-icon>shopping_bag</mat-icon>
          <h2>Your cart is empty</h2>
          <p>Explore our collections and add items you love.</p>
          <a routerLink="/products" class="btn-primary">Browse Collections</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-layout { display: grid; grid-template-columns: 1fr 340px; gap: 40px; align-items: start; }
    .cart-row { display: flex; align-items: center; gap: 16px; padding: 20px 0; border-bottom: 1px solid var(--color-border); }
    .cart-img { width: 80px; height: 100px; object-fit: cover; border-radius: var(--radius-sm); background: #f0ede8; }
    .cart-info { flex: 1; }
    .cart-name { font-family: var(--font-display); font-size: 1rem; font-weight: 600; color: var(--color-primary); display: block; }
    .cart-meta { font-size: 0.78rem; color: var(--color-text-muted); display: block; }
    .cart-price { font-size: 0.9rem; color: var(--color-text-muted); }
    .qty-control { display: flex; align-items: center; gap: 4px; }
    .qty { min-width: 28px; text-align: center; font-weight: 600; }
    .cart-subtotal { font-weight: 600; min-width: 80px; text-align: right; }
    /* Summary */
    .cart-summary { background: #fff; border-radius: var(--radius-md); padding: 28px; box-shadow: var(--shadow-sm); position: sticky; top: 88px; }
    .summary-title { font-family: var(--font-display); font-size: 1.3rem; color: var(--color-primary); margin-bottom: 16px; }
    .summary-row { display: flex; justify-content: space-between; padding: 12px 0; font-size: 0.9rem; }
    .summary-row.total { font-weight: 700; font-size: 1rem; }
    .checkout-btn { display: block; text-align: center; margin-top: 20px; padding: 14px; }
    /* Empty */
    .empty-cart { text-align: center; padding: 80px 0; }
    .empty-cart mat-icon { font-size: 4rem; color: var(--color-border); display: block; margin: 0 auto 16px; }
    .empty-cart h2 { font-family: var(--font-display); color: var(--color-primary); }
    .empty-cart p { color: var(--color-text-muted); margin: 8px 0 24px; }
    @media (max-width: 768px) { .cart-layout { grid-template-columns: 1fr; } }
  `]
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
