import { authApi } from '../auth/authApi';

export const employeesApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query({
      queryFn: async (arg, { getState }, extraOptions, baseQuery) => {
        const state = getState();
        const employee_id =
          (typeof arg === 'string' || typeof arg === 'number' ? arg : arg?.employee_id) ||
          state.auth?.user?.employee_id ||
          authApi.endpoints.getProfile.select()(state)?.data?.employee_id;

        if (!employee_id) {
          return { data: [] };
        }

        const otherParams = typeof arg === 'object' && arg !== null ? { ...arg } : {};
        delete otherParams.employee_id;

        const result = await baseQuery({
          url: '/api/v1/employees/employees',
          method: 'GET',
          params: {
            ...otherParams,
            employee_id,
          },
        });

        return result;
      },
      providesTags: ['Employees'],
    }),
    createEmployee: builder.mutation({
      queryFn: async (employeeData, { getState }, extraOptions, baseQuery) => {
        const state = getState();
        const current_employee_id =
          state.auth?.user?.employee_id ||
          authApi.endpoints.getProfile.select()(state)?.data?.employee_id ||
          employeeData.employee_id;

        const result = await baseQuery({
          url: '/api/v1/employees/employees',
          method: 'POST',
          params: {
            employee_id: current_employee_id,
          },
          body: {
            employee_id: employeeData.employee_id,
            first_name: employeeData.first_name,
            last_name: employeeData.last_name,
            email: employeeData.email,
            gender: employeeData.gender,
            base_location: employeeData.base_location,
            competency: employeeData.competency,
          },
        });

        return result;
      },
      invalidatesTags: ['Employees'],
    }),
    uploadEmployees: builder.mutation({
      query: (fileOrFormData) => {
        let body;
        if (fileOrFormData instanceof FormData) {
          body = fileOrFormData;
        } else {
          body = new FormData();
          body.append('file', fileOrFormData);
        }

        return {
          url: '/api/v1/employees/upload',
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body,
        };
      },
      invalidatesTags: ['Employees'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUploadEmployeesMutation,
} = employeesApi;
