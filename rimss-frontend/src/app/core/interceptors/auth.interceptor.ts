import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { switchMap, take, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { selectAuthToken } from '../../store/auth/auth.selectors';
import { logout } from '../../store/auth/auth.actions';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const store = inject(Store);
    const router = inject(Router);
    return store.select(selectAuthToken).pipe(
        take(1),
        switchMap(token => {
            if (token) {
                req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
            }
            return next(req).pipe(
                catchError(error => {
                    if (error.status === 401) {
                        store.dispatch(logout());
                        router.navigate(['/auth/login']);
                    }
                    return throwError(() => error);
                })
            );
        })
    );
};
