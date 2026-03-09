import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import * as CartActions from './cart.actions';
import { CartService } from '../../core/services/cart.service';

@Injectable()
export class CartEffects {
    private actions$ = inject(Actions);
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
}
