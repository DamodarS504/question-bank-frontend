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
    getAssignments: builder.query({
      query: () => ({
        url: '/api/v1/question-bank/list-assignments',
        method: 'GET',
      }),
      providesTags: ['Assignments'],
    }),
    getEmployeeAnswer: builder.query({
      query: ({ question_id }) => ({
        url: '/api/v1/question/answers',
        method: 'GET',
        params: { question_id },
      }),
      providesTags: (result, error, { question_id }) => [
        { type: 'EmployeeAnswers', id: question_id },
      ],
    }),
    submitEmployeeAnswer: builder.mutation({
      query: ({ question_id, answer, answer_rating = 5 }) => ({
        url: '/api/v1/question/answer',
        method: 'POST',
        body: {
          question_id,
          answer,
          answer_rating: Number(answer_rating) || 5,
        },
      }),
      invalidatesTags: (result, error, { question_id }) => [
        { type: 'EmployeeAnswers', id: question_id },
      ],
    }),
    updateEmployeeAnswer: builder.mutation({
      query: ({ answer_id, answer, answer_rating = 5 }) => ({
        url: `/api/v1/question/answer/${answer_id}`,
        method: 'PUT',
        body: {
          answer,
          answer_rating: Number(answer_rating) || 5,
        },
      }),
      invalidatesTags: (result, error, { question_id }) => [
        { type: 'EmployeeAnswers', id: question_id },
      ],
    }),
    deleteEmployeeAnswer: builder.mutation({
      query: ({ answer_id }) => ({
        url: `/api/v1/question/answer/${answer_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { question_id }) => [
        { type: 'EmployeeAnswers', id: question_id },
      ],
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
    updateQuestion: builder.mutation({
      query: ({ question_id, id, ...body }) => ({
        url: `/api/v1/question-bank/update-question/${question_id ?? id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Questions'],
    }),
    deleteQuestion: builder.mutation({
      query: (arg) => {
        const questionId = typeof arg === 'object' && arg !== null ? (arg.question_id ?? arg.id) : arg;
        return {
          url: `/api/v1/question-bank/delete-question/${questionId}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['Questions'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetQuestionsQuery,
  useGetAssignmentsQuery,
  useGetEmployeeAnswerQuery,
  useLazyGetEmployeeAnswerQuery,
  useSubmitEmployeeAnswerMutation,
  useUpdateEmployeeAnswerMutation,
  useDeleteEmployeeAnswerMutation,
  useUploadQuestionsMutation,
  useAssignQuestionsMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} = questionBankApi;
