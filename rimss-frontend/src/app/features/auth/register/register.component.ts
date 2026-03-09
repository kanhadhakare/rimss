import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Title } from '@angular/platform-browser';
import { register } from '../../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AsyncPipe, MatButtonModule,
    MatInputModule, MatFormFieldModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-brand">
          <span class="brand-y">Y</span><span class="brand-co">Company</span>
        </div>
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-sub">Join YCompany for an exclusive shopping experience</p>

        @if (error$ | async; as err) {
          <div class="auth-error">{{ err }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Full Name</mat-label>
            <mat-icon matPrefix>person</mat-icon>
            <input matInput formControlName="name" placeholder="John Smith" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Email</mat-label>
            <mat-icon matPrefix>email</mat-icon>
            <input matInput type="email" formControlName="email" placeholder="you@example.com" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Password</mat-label>
            <mat-icon matPrefix>lock</mat-icon>
            <input matInput [type]="showPwd ? 'text' : 'password'" formControlName="password" placeholder="Min. 6 characters" />
            <button mat-icon-button matSuffix type="button" (click)="showPwd = !showPwd">
              <mat-icon>{{ showPwd ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          <button type="submit" class="btn-primary submit-btn" [disabled]="form.invalid || (loading$ | async)">
            @if (loading$ | async) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              Create Account
            }
          </button>
        </form>

        <p class="auth-link">Already have an account? <a routerLink="/auth/login">Sign in</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: calc(100vh - 64px); display:flex; align-items:center; justify-content:center; background:var(--color-bg); padding:32px; }
    .auth-card { width:100%; max-width:420px; background:#fff; border-radius:var(--radius-lg); padding:40px; box-shadow:var(--shadow-lg); }
    .auth-brand { font-family:var(--font-display); font-size:1.8rem; font-weight:700; color:var(--color-primary); text-align:center; margin-bottom:20px; }
    .brand-y { color:var(--color-accent); } .brand-co { font-weight:300; }
    .auth-title { font-family:var(--font-display); font-size:1.6rem; color:var(--color-primary); text-align:center; margin-bottom:6px; }
    .auth-sub { font-size:0.88rem; color:var(--color-text-muted); text-align:center; margin-bottom:28px; }
    .auth-error { background:rgba(192,57,43,.1); color:var(--color-error); padding:10px 14px; border-radius:var(--radius-sm); font-size:0.85rem; margin-bottom:16px; }
    .w-full { width:100%; margin-bottom:4px; }
    .submit-btn { width:100%; justify-content:center; padding:14px; margin-top:8px; font-size:0.95rem; }
    .auth-link { text-align:center; font-size:0.85rem; color:var(--color-text-muted); margin-top:20px; }
    .auth-link a { color:var(--color-accent-dark); font-weight:600; }
  `]
})
export class RegisterComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);
  showPwd = false;

  constructor(private title: Title) { }
  ngOnInit() { this.title.setTitle('Register — YCompany'); }
  onSubmit() {
    if (this.form.valid) {
      const { name, email, password } = this.form.value;
      this.store.dispatch(register({ name: name!, email: email!, password: password! }));
    }
  }
}
