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
  imports: [
    ReactiveFormsModule, AsyncPipe, CurrencyPipe,
    MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule,
    MatStepperModule, MatDividerModule, MatSnackBarModule
  ],
  templateUrl: './checkout.component.html',
  styleUrls: [ './checkout.component.scss' ]
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
