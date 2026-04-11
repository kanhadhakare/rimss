import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { selectCartItems, selectCartTotal } from '../../store/cart/cart.selectors';
import { clearCart } from '../../store/cart/cart.actions';
import { OrderService } from '../../core/services/order.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe, CurrencyPipe,
    MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule,
    MatStepperModule, MatDividerModule, MatSnackBarModule],
  template: `
    <div class="container section">
      <h1 class="section-title">Checkout</h1>
      <div class="divider"></div>

      <div class="checkout-layout">
        <div class="checkout-form">
          <mat-stepper orientation="vertical" [linear]="true" #stepper>
            <!-- Step 1: Shipping -->
            <mat-step [stepControl]="shippingForm" label="Shipping Address">
              <form [formGroup]="shippingForm">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Full Name</mat-label>
                    <input matInput formControlName="fullName" placeholder="John Smith" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Postal Code</mat-label>
                    <input matInput formControlName="postalCode" placeholder="110001" />
                  </mat-form-field>
                </div>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Address</mat-label>
                  <input matInput formControlName="address" placeholder="123 High Street" />
                </mat-form-field>
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>City</mat-label>
                    <input matInput formControlName="city" placeholder="London" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Country</mat-label>
                    <input matInput formControlName="country" placeholder="India" />
                  </mat-form-field>
                </div>
                <button matStepperNext class="btn-primary" [disabled]="shippingForm.invalid">Continue to Payment</button>
              </form>
            </mat-step>

            <!-- Step 2: Payment -->
            <mat-step label="Payment">
              <div class="payment-box">
                <mat-icon class="payment-icon">lock</mat-icon>
                <p>Secure payment powered by Stripe</p>
                <div class="card-mock">
                  <div class="card-field"><label>Card Number</label><input placeholder="4242 4242 4242 4242" /></div>
                  <div class="form-row">
                    <div class="card-field"><label>Expiry</label><input placeholder="MM / YY" /></div>
                    <div class="card-field"><label>CVV</label><input placeholder="123" /></div>
                  </div>
                </div>
                <div class="step-btns">
                  <button matStepperPrevious class="btn-outline">Back</button>
                  <button class="btn-primary" (click)="placeOrder()" [disabled]="placing">
                    {{ placing ? 'Processing…' : 'Place Order' }}
                  </button>
                </div>
              </div>
            </mat-step>
          </mat-stepper>
        </div>

        <!-- Order Summary -->
        <div class="order-summary">
          <h2 class="summary-title">Your Order</h2>
          <mat-divider></mat-divider>
          @for (item of cartItems$ | async; track item._id) {
            <div class="summary-item">
              <img [src]="item.product.images[0]" [alt]="item.product.name" class="summary-img" />
              <div>
                <div class="summary-name">{{ item.product.name }}</div>
                <div class="summary-qty">Qty: {{ item.quantity }}</div>
              </div>
              <span>{{ item.product.salePrice * item.quantity | currency:'INR' }}</span>
            </div>
          }
          <mat-divider></mat-divider>
          <div class="summary-total">
            <span>Total</span>
            <span>{{ cartTotal$ | async | currency:'INR' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-layout { display: grid; grid-template-columns: 1fr 360px; gap: 40px; align-items: start; }
    .checkout-form { background: #fff; border-radius: var(--radius-md); padding: 28px; box-shadow: var(--shadow-sm); }
    .w-full { width: 100%; }
    .step-btns { display: flex; gap: 12px; margin-top: 16px; }
    .payment-box { padding: 16px 0; }
    .payment-icon { color: var(--color-accent); font-size: 1.6rem; }
    .payment-box p { color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 20px; }
    .card-mock { border: 1.5px solid var(--color-border); border-radius: var(--radius-md); padding: 20px; background: #fafaf8; }
    .card-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .card-field label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); }
    .card-field input { border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 10px 12px; font-size: 0.95rem; font-family: var(--font-body); outline: none; }
    .card-field input:focus { border-color: var(--color-accent); }
    /* Summary */
    .order-summary { background: #fff; border-radius: var(--radius-md); padding: 24px; box-shadow: var(--shadow-sm); position: sticky; top: 88px; }
    .summary-title { font-family: var(--font-display); font-size: 1.3rem; color: var(--color-primary); margin-bottom: 16px; }
    .summary-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; }
    .summary-img { width: 56px; height: 72px; object-fit: cover; border-radius: var(--radius-sm); background: #f0ede8; }
    .summary-name { font-size: 0.88rem; font-weight: 600; color: var(--color-primary); }
    .summary-qty { font-size: 0.78rem; color: var(--color-text-muted); }
    .summary-item > span { margin-left: auto; font-weight: 600; }
    .summary-total { display: flex; justify-content: space-between; padding: 16px 0 0; font-weight: 700; font-size: 1rem; }
    @media (max-width: 768px) { .checkout-layout { grid-template-columns: 1fr; } }
  `]
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  cartItems$ = this.store.select(selectCartItems);
  cartTotal$ = this.store.select(selectCartTotal);
  placing = false;
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  shippingForm = this.fb.group({
    fullName: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: ['', Validators.required],
    country: ['India', Validators.required],
  });

  constructor(private orderService: OrderService, private router: Router,
    private snackBar: MatSnackBar, private title: Title) { }

  ngOnInit() {
    this.title.setTitle('Checkout — YCompany');
    
    this.userService.getProfile().pipe(takeUntil(this.destroy$)).subscribe({
      next: (profile) => {
        if (profile.addresses && profile.addresses.length > 0) {
          const address = profile.addresses.find(a => a.isHome) || profile.addresses[0];
          this.shippingForm.patchValue({
            fullName: address.fullName,
            address: address.addressLine,
            city: address.city,
            postalCode: address.postalCode,
            country: address.country
          });
        } else if (profile.name) {
          this.shippingForm.patchValue({ fullName: profile.name });
        }
      },
      error: () => {}
    });
  }

  placeOrder() {
    this.placing = true;
    this.cartTotal$.pipe(takeUntil(this.destroy$)).subscribe(total => {
      const orderData = {
        shippingAddress: this.shippingForm.value,
        stripePaymentIntentId: 'mock_' + Date.now(),
      };
      this.orderService.placeOrder(orderData).subscribe({
        next: () => {
          this.store.dispatch(clearCart());
          this.router.navigate(['/order-success']);
        },
        error: (err) => {
          this.placing = false;
          this.snackBar.open(err.error?.message || 'Order failed', 'Dismiss', { duration: 4000 });
        }
      });
    }).unsubscribe();
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}
