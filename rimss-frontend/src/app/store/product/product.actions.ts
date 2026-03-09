import { createAction, props } from '@ngrx/store';
import { Product, ProductFilter } from '../../core/services/product.service';

export const loadProducts = createAction('[Product] Load Products', props<{ filters: ProductFilter }>());
export const loadProductsSuccess = createAction('[Product] Load Products Success', props<{ products: Product[]; total: number; pages: number }>());
export const loadProductsFailure = createAction('[Product] Load Products Failure', props<{ error: string }>());

export const loadProduct = createAction('[Product] Load Product', props<{ id: string }>());
export const loadProductSuccess = createAction('[Product] Load Product Success', props<{ product: Product }>());
export const loadProductFailure = createAction('[Product] Load Product Failure', props<{ error: string }>());

export const setFilters = createAction('[Product] Set Filters', props<{ filters: ProductFilter }>());
export const clearSelected = createAction('[Product] Clear Selected');
