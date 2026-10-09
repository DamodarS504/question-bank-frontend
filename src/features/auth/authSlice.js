import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accessToken: null,
  tokenType: null,
  user: null,
  isAuthenticated: false,
  sessionExpired: false,
};

export function getUserRole(user) {
  return String(user?.role ?? '').trim().toUpperCase();
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const payload = action.payload || {};
      const token = payload.access_token || payload.accessToken || payload.token || null;
      const tokenType = payload.token_type || payload.tokenType || (token ? 'bearer' : null);
      const user = payload.user || state.user || null;

      state.accessToken = token;
      state.tokenType = tokenType;
      state.user = user;
      state.isAuthenticated = true;
      state.sessionExpired = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.sessionExpired = false;
    },
    logout: (state) => {
      state.accessToken = null;
      state.tokenType = null;
      state.user = null;
      state.isAuthenticated = false;
      state.sessionExpired = false;
    },
    expireSession: (state) => {
      state.accessToken = null;
      state.tokenType = null;
      state.user = null;
      state.isAuthenticated = false;
      state.sessionExpired = true;
    },
  },
});

export const { setCredentials, setUser, logout, expireSession } = authSlice.actions;
export default authSlice.reducer;