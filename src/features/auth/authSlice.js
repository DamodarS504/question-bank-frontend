import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accessToken: localStorage.getItem('questionHubAccessToken'),
  tokenType: localStorage.getItem('questionHubTokenType'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { access_token: accessToken, token_type: tokenType } = action.payload;
      state.accessToken = accessToken;
      state.tokenType = tokenType;
      localStorage.setItem('questionHubAccessToken', accessToken);
      localStorage.setItem('questionHubTokenType', tokenType);
    },
    logout: (state) => {
      state.accessToken = null;
      state.tokenType = null;
      localStorage.removeItem('questionHubAccessToken');
      localStorage.removeItem('questionHubTokenType');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;