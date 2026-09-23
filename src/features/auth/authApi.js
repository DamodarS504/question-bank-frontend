import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.4.9.38:8000';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('questionHubAccessToken');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (body) => ({
        url: '/auth/auth/signup',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation({
      query: (body) => ({
        url: '/auth/auth/login',
        method: 'POST',
        body,
      }),
    }),
    getProfile: builder.query({
      query: () => '/auth/auth/me',
      providesTags: ['Profile'],
    }),
  }),
});

export const { useSignupMutation, useLoginMutation, useGetProfileQuery } = authApi;

export function getApiErrorMessage(error) {
  if (!error) return 'Something went wrong. Please try again.';
  if (typeof error.data?.detail === 'string') return error.data.detail;
  if (Array.isArray(error.data?.detail)) {
    return error.data.detail.map((item) => item.msg).join('. ');
  }
  if (error.status === 'FETCH_ERROR') {
    return 'Unable to reach the server. Check your connection and try again.';
  }
  return 'Something went wrong. Please try again.';
}