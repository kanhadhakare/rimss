import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import * as ProductActions from './product.actions';
import { ProductService } from '../../core/services/product.service';

@Injectable()
export class ProductEffects {
    private actions$ = inject(Actions);
    private productService = inject(ProductService);

    loadProducts$ = createEffect(() => this.actions$.pipe(
        ofType(ProductActions.loadProducts),
        switchMap(({ filters }) =>
            this.productService.getProducts(filters).pipe(
                map(res => ProductActions.loadProductsSuccess({ products: res.products, total: res.total, pages: res.pages })),
                catchError(err => of(ProductActions.loadProductsFailure({ error: err.error?.message || 'Failed to load products' })))
            )
        )
    ));

    loadProduct$ = createEffect(() => this.actions$.pipe(
        ofType(ProductActions.loadProduct),
        switchMap(({ id }) =>
            this.productService.getProduct(id).pipe(
                map(product => ProductActions.loadProductSuccess({ product })),
                catchError(err => of(ProductActions.loadProductFailure({ error: err.error?.message || 'Product not found' })))
            )
        )
    ));
}
