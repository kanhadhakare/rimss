import { createReducer, on } from '@ngrx/store';
import { CartItem } from '../../core/services/cart.service';
import * as CartActions from './cart.actions';

export interface LocalCartItem {
    id: string; product: any; quantity: number; size: string; color: string;
}

export interface CartState {
    items: CartItem[];
    localItems: LocalCartItem[];
    total: number;
    loading: boolean;
    error: string | null;
}

export const initialState: CartState = {
    items: [],
    localItems: loadLocalCart(),
    total: 0,
    loading: false,
    error: null,
};

function loadLocalCart(): LocalCartItem[] {
    try { return JSON.parse(localStorage.getItem('rimss_local_cart') || '[]'); }
    catch { return []; }
}

function saveLocalCart(items: LocalCartItem[]) {
    try { localStorage.setItem('rimss_local_cart', JSON.stringify(items)); } catch { }
}

export const cartReducer = createReducer(
    initialState,
    on(CartActions.loadCart, state => ({ ...state, loading: true })),
    on(CartActions.loadCartSuccess, CartActions.addToCartSuccess,
        CartActions.updateCartItemSuccess, CartActions.removeCartItemSuccess,
        (state, { items, total }) => ({ ...state, loading: false, items, total })),
    on(CartActions.clearCart, CartActions.clearCartSuccess, state => ({ ...state, items: [], total: 0 })),
    // Local cart mutations
    on(CartActions.addToLocalCart, (state, { product, quantity, size, color }) => {
        const existing = state.localItems.find(i => i.product._id === product._id && i.size === size && i.color === color);
        let localItems: LocalCartItem[];
        if (existing) {
            localItems = state.localItems.map(i =>
                i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i
            );
        } else {
            localItems = [...state.localItems, { id: Date.now().toString(), product, quantity, size, color }];
        }
        saveLocalCart(localItems);
        return { ...state, localItems };
    }),
    on(CartActions.removeFromLocalCart, (state, { itemId }) => {
        const localItems = state.localItems.filter(i => i.id !== itemId);
        saveLocalCart(localItems);
        return { ...state, localItems };
    }),
    on(CartActions.updateLocalCartItem, (state, { itemId, quantity }) => {
        const localItems = quantity <= 0
            ? state.localItems.filter(i => i.id !== itemId)
            : state.localItems.map(i => i.id === itemId ? { ...i, quantity } : i);
        saveLocalCart(localItems);
        return { ...state, localItems };
    }),
    on(CartActions.clearLocalCart, state => {
        saveLocalCart([]);
        return { ...state, localItems: [] };
    }),
);
