import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, map, catchError, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../core/services/auth.service';

@Injectable()
export class AuthEffects {
    private actions$ = inject(Actions);
    private authService = inject(AuthService);
    private router = inject(Router);

    login$ = createEffect(() => this.actions$.pipe(
        ofType(AuthActions.login),
        switchMap(({ email, password }) =>
            this.authService.login({ email, password }).pipe(
                map(res => AuthActions.loginSuccess({ token: res.token, user: res.user })),
                catchError(err => of(AuthActions.loginFailure({ error: err.error?.message || 'Login failed' })))
            )
        )
    ));

    register$ = createEffect(() => this.actions$.pipe(
        ofType(AuthActions.register),
        switchMap(({ name, email, password }) =>
            this.authService.register({ name, email, password }).pipe(
                map(res => AuthActions.registerSuccess({ token: res.token, user: res.user })),
                catchError(err => of(AuthActions.registerFailure({ error: err.error?.message || 'Registration failed' })))
            )
        )
    ));

    redirectOnSuccess$ = createEffect(() => this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
        tap(() => this.router.navigate(['/']))
    ), { dispatch: false });

    redirectOnLogout$ = createEffect(() => this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => this.router.navigate(['/']))
    ), { dispatch: false });
}
