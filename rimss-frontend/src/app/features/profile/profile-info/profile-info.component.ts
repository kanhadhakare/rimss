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
    templateUrl: './profile-info.component.html',
    styleUrls: ['./profile-info.component.scss']
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
