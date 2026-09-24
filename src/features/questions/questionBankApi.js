import { authApi } from '../auth/authApi';

export const questionBankApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuestions: builder.query({
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
          url: '/api/v1/question-bank/questions',
          method: 'GET',
          params: {
            ...otherParams,
            employee_id,
          },
        });

        return result;
      },
      providesTags: ['Questions'],
    }),
    uploadQuestions: builder.mutation({
      query: (fileOrFormData) => {
        let body;
        if (fileOrFormData instanceof FormData) {
          body = fileOrFormData;
        } else {
          body = new FormData();
          body.append('file', fileOrFormData);
        }

        return {
          url: '/api/v1/question-bank/upload',
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body,
        };
      },
      invalidatesTags: ['Questions'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetQuestionsQuery, useUploadQuestionsMutation } = questionBankApi;
