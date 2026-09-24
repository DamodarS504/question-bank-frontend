import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accessToken: null,
  tokenType: null,
  user: null,
  isAuthenticated: false,
};

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
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.accessToken = null;
      state.tokenType = null;
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;