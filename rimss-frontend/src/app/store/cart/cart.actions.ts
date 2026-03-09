import { createAction, props } from '@ngrx/store';
import { CartItem } from '../../core/services/cart.service';

export const loadCart = createAction('[Cart] Load Cart');
export const loadCartSuccess = createAction('[Cart] Load Cart Success', props<{ items: CartItem[]; total: number }>());
export const loadCartFailure = createAction('[Cart] Load Cart Failure', props<{ error: string }>());

export const addToCart = createAction('[Cart] Add Item', props<{ productId: string; quantity: number; size: string; color: string }>());
export const addToCartSuccess = createAction('[Cart] Add Item Success', props<{ items: CartItem[]; total: number }>());

export const updateCartItem = createAction('[Cart] Update Item', props<{ itemId: string; quantity: number }>());
export const updateCartItemSuccess = createAction('[Cart] Update Item Success', props<{ items: CartItem[]; total: number }>());

export const removeCartItem = createAction('[Cart] Remove Item', props<{ itemId: string }>());
export const removeCartItemSuccess = createAction('[Cart] Remove Item Success', props<{ items: CartItem[]; total: number }>());

export const clearCart = createAction('[Cart] Clear Cart');
export const clearCartSuccess = createAction('[Cart] Clear Cart Success');

// Local-only cart for guests
export const addToLocalCart = createAction('[Cart] Add To Local', props<{ product: any; quantity: number; size: string; color: string }>());
export const removeFromLocalCart = createAction('[Cart] Remove From Local', props<{ itemId: string }>());
export const updateLocalCartItem = createAction('[Cart] Update Local Item', props<{ itemId: string; quantity: number }>());
