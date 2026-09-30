import { authApi } from '../auth/authApi';

export const questionBankApi = authApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuestions: builder.query({
      query: () => ({
        url: '/api/v1/question-bank/questions',
        method: 'GET',
      }),
      providesTags: ['Questions'],
    }),
    getAssignments: builder.query({
      query: () => ({
        url: '/api/v1/question-bank/list-assignments',
        method: 'GET',
      }),
      providesTags: ['Assignments'],
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
    assignQuestions: builder.mutation({
      query: ({ userIds, questionIds, assignedDate }) => ({
        url: '/api/v1/question-bank/assign-questions',
        method: 'POST',
        body: {
          user_id: userIds,
          question_ids: questionIds,
          assigned_date: assignedDate,
        },
      }),
      invalidatesTags: ['Assignments'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetQuestionsQuery,
  useGetAssignmentsQuery,
  useUploadQuestionsMutation,
  useAssignQuestionsMutation,
} = questionBankApi;
