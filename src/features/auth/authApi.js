import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.accessToken;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (headers.get('Content-Type') === 'multipart/form-data') {
      headers.delete('Content-Type');
    } else if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    return headers;
  },
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['Profile', 'Questions'],
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (body) => ({
        url: '/api/v1/auth/signup',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => {
        const body = new URLSearchParams();
        if (credentials instanceof FormData) {
          for (const [key, value] of credentials.entries()) {
            body.append(key, value);
          }
        } else {
          body.append('username', credentials.username || credentials.email || '');
          body.append('password', credentials.password || '');
          if (credentials.grant_type) {
            body.append('grant_type', credentials.grant_type);
          }
        }

        return {
          url: '/api/v1/auth/login',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        };
      },
      invalidatesTags: ['Profile'],
    }),
    logoutApi: builder.mutation({
      query: () => ({
        url: '/api/v1/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Profile'],
    }),
    getProfile: builder.query({
      query: () => '/api/v1/auth/admin_profile',
      providesTags: ['Profile'],
    }),
  }),
});

export const { useSignupMutation, useLoginMutation, useLogoutApiMutation, useGetProfileQuery } = authApi;

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