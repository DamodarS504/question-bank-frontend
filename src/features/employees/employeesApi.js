import { authApi } from '../auth/authApi';

export const employeesApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: (params = {}) => ({
          url: '/api/v1/employees',
          method: 'GET',
          params,
        }),
      providesTags: ['Employees'],
    }),
    deleteEmployee: builder.mutation({
      query: (arg) => ({
          url: `/api/v1/employees/${arg.userId ?? arg.id}`,
          method: 'DELETE',
        }),
      invalidatesTags: ['Employees'],
    }),
    createEmployee: builder.mutation({
      query: (employeeData) => ({
          url: '/api/v1/employees',
          method: 'POST',
          body: {
            employee_id: employeeData.employee_id,
            first_name: employeeData.first_name,
            last_name: employeeData.last_name,
            email: employeeData.email,
            gender: employeeData.gender,
            base_location: employeeData.base_location,
            competency: employeeData.competency,
          },
        }),
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
  useDeleteEmployeeMutation,
  useCreateEmployeeMutation,
  useUploadEmployeesMutation,
} = employeesApi;
