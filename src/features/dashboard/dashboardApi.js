/**
 * src/features/dashboard/dashboardApi.js
 * RTK Query endpoints for the Admin & Executive Dashboard.
 */
import { authApi } from '../auth/authApi';

export const dashboardApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSummary: builder.query({
      query: () => ({
        url: '/api/v1/dashboard/admin-summary',
        method: 'GET',
      }),
      providesTags: ['Questions', 'Employees', 'Assignments'],
    }),
  }),
});

export const { useGetAdminSummaryQuery } = dashboardApi;
