import { createSelector, createFeatureSelector } from '@ngrx/store';
import { ProductState } from './product.reducer';

export const selectProductState = createFeatureSelector<ProductState>('product');
export const selectAllProducts = createSelector(selectProductState, s => s.products);
export const selectSelectedProduct = createSelector(selectProductState, s => s.selected);
export const selectProductLoading = createSelector(selectProductState, s => s.loading);
export const selectProductError = createSelector(selectProductState, s => s.error);
export const selectProductFilters = createSelector(selectProductState, s => s.filters);
export const selectProductTotal = createSelector(selectProductState, s => s.total);
