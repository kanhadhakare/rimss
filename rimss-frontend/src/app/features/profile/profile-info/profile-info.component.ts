import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserProfile } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
    selector: 'app-profile-info',
    standalone: true,
    imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
    template: `
    @if (profile) {
    <div class="profile-info-container">
      <h2 class="sub-title">Personal Details</h2>

      <mat-card class="info-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="updateProfile()">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name" />
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email Address</mat-label>
              <input matInput [value]="profile.email" disabled />
              <mat-hint>Email cannot be changed</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full mt-4">
              <mat-label>New Password (Optional)</mat-label>
              <input matInput [type]="showPwd ? 'text' : 'password'" formControlName="password" />
              <button mat-icon-button matSuffix type="button" (click)="showPwd = !showPwd">
                 <mat-icon>{{ showPwd ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <div class="form-actions">
              <button type="submit" class="btn-primary" [disabled]="form.invalid || !form.dirty || updating">
                @if (updating) { <mat-spinner strokeWidth="2" diameter="20"></mat-spinner> } 
                @else { Save Changes }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
    }
  `,
    styles: [`
    .sub-title { font-family: var(--font-display); font-size: 1.5rem; color: var(--color-primary); margin-bottom: 24px; }
    .profile-info-container { max-width: 600px; }
    .info-card { padding: 32px 24px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); border: 1px solid var(--color-border); }
    .w-full { width: 100%; margin-bottom: 12px; }
    .mt-4 { margin-top: 16px; }
    .form-actions { margin-top: 24px; display: flex; justify-content: flex-end; }
  `]
})
export class ProfileInfoComponent {
    @Input() set profile(val: UserProfile) {
        if (val) {
            this._profile = val;
            this.form.patchValue({ name: val.name, password: '' });
        }
    }
    get profile() { return this._profile; }
    private _profile!: UserProfile;

    @Output() profileUpdated = new EventEmitter<void>();

    private fb = inject(FormBuilder);
    private userService = inject(UserService);
    private snackBar = inject(MatSnackBar);

    form = this.fb.group({
        name: ['', Validators.required],
        password: ['']
    });

    updating = false;
    showPwd = false;

    updateProfile() {
        if (this.form.invalid) return;
        this.updating = true;

        const data: any = { name: this.form.value.name };
        if (this.form.value.password) data.password = this.form.value.password;

        this.userService.updateProfile(data).subscribe({
            next: () => {
                this.updating = false;
                this.snackBar.open('Profile updated successfully', 'Dismiss', { duration: 3000 });
                this.form.markAsPristine();
                this.profileUpdated.emit();
            },
            error: () => {
                this.updating = false;
                this.snackBar.open('Failed to update profile', 'Dismiss', { duration: 3000 });
            }
        });
    }
}
