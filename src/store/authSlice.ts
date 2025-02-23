import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  userName: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userName: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      state.userName = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userName = null;
    },
    initializeAuth: (state) => {
      const token = localStorage.getItem('token');
      const fullName = localStorage.getItem('fullName');
      if (token) {
        state.isAuthenticated = true;
        state.userName = fullName;
      }
    },
  },
});

export const { login, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;

// Selector
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUserName = (state: { auth: AuthState }) => state.auth.userName;
