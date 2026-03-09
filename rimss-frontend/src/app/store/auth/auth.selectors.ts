import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');
export const selectAuthToken = createSelector(selectAuthState, s => s.token);
export const selectAuthUser = createSelector(selectAuthState, s => s.user);
export const selectIsLoggedIn = createSelector(selectAuthState, s => !!s.token);
export const selectAuthLoading = createSelector(selectAuthState, s => s.loading);
export const selectAuthError = createSelector(selectAuthState, s => s.error);
