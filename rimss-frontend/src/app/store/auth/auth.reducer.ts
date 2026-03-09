import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';

export interface AuthState {
    token: string | null;
    user: any | null;
    loading: boolean;
    error: string | null;
}

function loadFromStorage(): Partial<AuthState> {
    try {
        const token = localStorage.getItem('rimss_token');
        const user = localStorage.getItem('rimss_user');
        return { token: token || null, user: user ? JSON.parse(user) : null };
    } catch { return {}; }
}

const stored = loadFromStorage();

export const initialState: AuthState = {
    token: stored.token || null,
    user: stored.user || null,
    loading: false,
    error: null,
};

export const authReducer = createReducer(
    initialState,
    on(AuthActions.login, AuthActions.register, state => ({ ...state, loading: true, error: null })),
    on(AuthActions.loginSuccess, AuthActions.registerSuccess, (state, { token, user }) => {
        localStorage.setItem('rimss_token', token);
        localStorage.setItem('rimss_user', JSON.stringify(user));
        return { ...state, token, user, loading: false, error: null };
    }),
    on(AuthActions.loginFailure, AuthActions.registerFailure, (state, { error }) => ({
        ...state, loading: false, error,
    })),
    on(AuthActions.logout, () => {
        localStorage.removeItem('rimss_token');
        localStorage.removeItem('rimss_user');
        return { token: null, user: null, loading: false, error: null };
    })
);
