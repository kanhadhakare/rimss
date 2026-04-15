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
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
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
