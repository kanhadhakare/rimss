import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    },
    {
        path: 'products',
        loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent),
    },
    {
        path: 'product/:id',
        loadComponent: () => import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
    },
    {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
    },
    {
        path: 'checkout',
        loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
        canActivate: [authGuard],
    },
    {
        path: 'auth/login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    },
    {
        path: 'auth/register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    },
    {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard],
    },
    {
        path: 'order-success',
        loadComponent: () => import('./features/order-success/order-success.component').then(m => m.OrderSuccessComponent),
    },
    { path: '**', redirectTo: '' },
];
