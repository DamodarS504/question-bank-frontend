import { authApi } from '../auth/authApi';

export const questionBankApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuestions: builder.query({
      query: (params) => ({
        url: '/api/v1/question-bank/questions',
        method: 'GET',
        params,
      }),
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
