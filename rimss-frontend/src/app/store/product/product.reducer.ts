import { createReducer, on } from '@ngrx/store';
import { Product, ProductFilter } from '../../core/services/product.service';
import * as ProductActions from './product.actions';

export interface ProductState {
    products: Product[];
    selected: Product | null;
    total: number; pages: number;
    filters: ProductFilter;
    loading: boolean; error: string | null;
}

export const initialState: ProductState = {
    products: [], selected: null,
    total: 0, pages: 1,
    filters: { page: 1, limit: 12 },
    loading: false, error: null,
};

export const productReducer = createReducer(
    initialState,
    on(ProductActions.loadProducts, (state, { filters }) => ({ ...state, loading: true, error: null, filters })),
    on(ProductActions.loadProductsSuccess, (state, { products, total, pages }) => ({
        ...state, loading: false, products, total, pages,
    })),
    on(ProductActions.loadProductsFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(ProductActions.loadProduct, state => ({ ...state, loading: true, error: null })),
    on(ProductActions.loadProductSuccess, (state, { product }) => ({ ...state, loading: false, selected: product })),
    on(ProductActions.loadProductFailure, (state, { error }) => ({ ...state, loading: false, error })),
    on(ProductActions.setFilters, (state, { filters }) => ({ ...state, filters: { ...state.filters, ...filters } })),
    on(ProductActions.clearSelected, state => ({ ...state, selected: null })),
);
