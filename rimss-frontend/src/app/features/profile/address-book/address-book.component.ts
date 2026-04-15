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
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.scss']
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
