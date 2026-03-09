import { createSelector, createFeatureSelector } from '@ngrx/store';
import { CartState } from './cart.reducer';
export { selectIsLoggedIn } from '../auth/auth.selectors';

export const selectCartState = createFeatureSelector<CartState>('cart');
export const selectCartItems = createSelector(selectCartState, s => s.items);
export const selectLocalCartItems = createSelector(selectCartState, s => s.localItems);
export const selectCartTotal = createSelector(selectCartState, s => s.total);
export const selectCartItemCount = createSelector(
    selectCartState,
    s => s.items.reduce((n, i) => n + i.quantity, 0) + s.localItems.reduce((n, i) => n + i.quantity, 0)
);
export const selectLocalCartTotal = createSelector(
    selectCartState,
    s => s.localItems.reduce((sum, i) => sum + (i.product.salePrice ?? i.product.price) * i.quantity, 0)
);
