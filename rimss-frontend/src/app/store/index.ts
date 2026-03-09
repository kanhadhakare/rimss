import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { authReducer, AuthState } from './auth/auth.reducer';
import { productReducer, ProductState } from './product/product.reducer';
import { cartReducer, CartState } from './cart/cart.reducer';

export interface AppState {
    auth: AuthState;
    product: ProductState;
    cart: CartState;
}

export const reducers: ActionReducerMap<AppState> = {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer,
};

export const metaReducers: MetaReducer<AppState>[] = [];
