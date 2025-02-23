import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import authReducer, { initializeAuth } from './authSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
  },
});

// Initialize auth state based on localStorage
store.dispatch(initializeAuth());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 