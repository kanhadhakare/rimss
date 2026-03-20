import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, forkJoin } from 'rxjs';
import { switchMap, map, catchError, withLatestFrom, concatMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as CartActions from './cart.actions';
import * as AuthActions from '../auth/auth.actions';
import { CartService } from '../../core/services/cart.service';
import { selectLocalCartItems } from './cart.selectors';

@Injectable()
export class CartEffects {
    private actions$ = inject(Actions);
    private store = inject(Store);
    private cartService = inject(CartService);

    private mapCart = (cart: any) => ({ items: cart.items || [], total: cart.total || 0 });

    loadCart$ = createEffect(() => this.actions$.pipe(
        ofType(CartActions.loadCart),
        switchMap(() => this.cartService.getCart().pipe(
            map(cart => CartActions.loadCartSuccess(this.mapCart(cart))),
            catchError(err => of(CartActions.loadCartFailure({ error: err.message })))
        ))
    ));

    addToCart$ = createEffect(() => this.actions$.pipe(
        ofType(CartActions.addToCart),
        switchMap(({ productId, quantity, size, color }) =>
            this.cartService.addItem(productId, quantity, size, color).pipe(
                map(cart => CartActions.addToCartSuccess(this.mapCart(cart))),
                catchError(err => of(CartActions.loadCartFailure({ error: err.message })))
            )
        )
    ));

    updateCartItem$ = createEffect(() => this.actions$.pipe(
        ofType(CartActions.updateCartItem),
        switchMap(({ itemId, quantity }) =>
            this.cartService.updateItem(itemId, quantity).pipe(
                map(cart => CartActions.updateCartItemSuccess(this.mapCart(cart))),
                catchError(err => of(CartActions.loadCartFailure({ error: err.message })))
            )
        )
    ));

    removeCartItem$ = createEffect(() => this.actions$.pipe(
        ofType(CartActions.removeCartItem),
        switchMap(({ itemId }) =>
            this.cartService.removeItem(itemId).pipe(
                map(cart => CartActions.removeCartItemSuccess(this.mapCart(cart))),
                catchError(err => of(CartActions.loadCartFailure({ error: err.message })))
            )
        )
    ));

    syncLocalCart$ = createEffect(() => this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
        withLatestFrom(this.store.select(selectLocalCartItems)),
        concatMap(([_, localItems]) => {
            if (!localItems || localItems.length === 0) {
                return of(CartActions.loadCart());
            }
            const syncReqs = localItems.map(item =>
                this.cartService.addItem(item.product._id, item.quantity, item.size, item.color)
            );
            return forkJoin(syncReqs).pipe(
                map(() => {
                    this.store.dispatch(CartActions.clearLocalCart());
                    return CartActions.loadCart();
                }),
                catchError(() => of(CartActions.loadCart()))
            );
        })
    ));
}
