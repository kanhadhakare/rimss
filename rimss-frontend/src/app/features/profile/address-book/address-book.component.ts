import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Address } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-address-book',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatCheckboxModule],
  template: `
    <div class="address-container">
      <div class="header-row">
        <h2 class="sub-title">Saved Addresses</h2>
        @if (!showForm) {
          <button mat-button class="btn-accent" (click)="showForm = true">
            <mat-icon>add</mat-icon> Add New Address
          </button>
        }
      </div>

      <!-- Address Form -->
      @if (showForm) {
        <mat-card class="address-form-card">
          <mat-card-header>
            <mat-card-title>{{ editingId ? 'Edit Address' : 'New Address' }}</mat-card-title>
          </mat-card-header>
          <form [formGroup]="form" (ngSubmit)="saveAddress()">
            <mat-card-content class="form-grid">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="fullName" />
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Address Line</mat-label>
                <input matInput formControlName="addressLine" />
              </mat-form-field>
              
              <div class="two-col">
                <mat-form-field appearance="outline">
                  <mat-label>City</mat-label>
                  <input matInput formControlName="city" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Postal Code</mat-label>
                  <input matInput formControlName="postalCode" />
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Country</mat-label>
                <input matInput formControlName="country" />
              </mat-form-field>

              <mat-checkbox formControlName="isHome" color="primary">Set as default home address</mat-checkbox>
            </mat-card-content>
            <mat-card-actions class="form-actions">
              <button type="button" mat-button (click)="cancelEdit()">Cancel</button>
              <button type="submit" mat-raised-button color="primary" [disabled]="form.invalid">Save Address</button>
            </mat-card-actions>
          </form>
        </mat-card>
      }

      <!-- Address List -->
      <div class="address-grid">
        @for (addr of addresses; track addr._id) {
          <mat-card class="address-card" [class.is-home]="addr.isHome">
            <mat-card-content>
              <div class="card-top">
                <h3 class="name">{{ addr.fullName }}</h3>
                @if (addr.isHome) {
                  <mat-chip highlighted color="accent" class="home-chip">★ Home</mat-chip>
                }
              </div>
              <p class="addr-line">{{ addr.addressLine }}</p>
              <p class="addr-line">{{ addr.city }}, {{ addr.postalCode }}</p>
              <p class="addr-line">{{ addr.country }}</p>
            </mat-card-content>
            <mat-card-actions class="card-actions">
              <button mat-button color="primary" (click)="editAddress(addr)">Edit</button>
              <button mat-button color="warn" (click)="deleteAddress(addr._id!)">Delete</button>
            </mat-card-actions>
          </mat-card>
        }
        @if (!addresses || addresses.length === 0 && !showForm) {
          <div class="empty-state">
            <p>No addresses saved yet.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .sub-title { font-family: var(--font-display); font-size: 1.5rem; color: var(--color-primary); margin: 0; }
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .address-form-card { margin-bottom: 32px; padding: 24px; border: 1px solid var(--color-border); box-shadow: var(--shadow-sm); }
    .form-grid { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
    .full-width { width: 100%; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 16px; }
    
    .address-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .address-card { border: 1px solid var(--color-border); box-shadow: none; border-radius: var(--radius-md); transition: all 0.2s; }
    .address-card.is-home { border-color: var(--color-accent); border-width: 2px; background: #fafaf8; }
    
    .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .name { font-weight: 600; font-size: 1.1rem; color: var(--color-primary); margin: 0; }
    .home-chip { min-height: 24px; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em; }
    .addr-line { margin: 0 0 4px; color: var(--color-text-muted); font-size: 0.95rem; }
    .card-actions { border-top: 1px solid var(--color-border); margin-top: 16px; padding: 8px 16px; display: flex; justify-content: space-between; }
    .empty-state { grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--color-text-muted); background: #fafaf8; border-radius: var(--radius-md); }
  `]
})
export class AddressBookComponent {
  @Input() addresses: Address[] = [];
  @Output() addressesUpdated = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  showForm = false;
  editingId: string | null = null;

  form = this.fb.group({
    fullName: ['', Validators.required],
    addressLine: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: ['', Validators.required],
    country: ['', Validators.required],
    isHome: [false]
  });

  editAddress(addr: Address) {
    this.editingId = addr._id!;
    this.form.patchValue(addr);
    this.showForm = true;
  }

  cancelEdit() {
    this.showForm = false;
    this.editingId = null;
    this.form.reset({ isHome: false });
  }

  saveAddress() {
    if (this.form.invalid) return;

    const val = this.form.value as Partial<Address>;
    const req$ = this.editingId
      ? this.userService.updateAddress(this.editingId, val)
      : this.userService.addAddress(val);

    req$.subscribe({
      next: () => {
        this.snackBar.open(`Address ${this.editingId ? 'updated' : 'added'}!`, 'Dismiss', { duration: 3000 });
        this.cancelEdit();
        this.addressesUpdated.emit();
      },
      error: () => this.snackBar.open('Failed to save address', 'Dismiss', { duration: 3000 })
    });
  }

  deleteAddress(id: string) {
    if (confirm('Are you sure you want to delete this address?')) {
      this.userService.deleteAddress(id).subscribe({
        next: () => {
          this.snackBar.open('Address deleted', 'Dismiss', { duration: 3000 });
          this.addressesUpdated.emit();
        },
        error: () => this.snackBar.open('Failed to delete address', 'Dismiss', { duration: 3000 })
      });
    }
  }
}
