import DashboardLayout from '../Dashboard/DashboardLayout';
import { getApiErrorMessage } from '../../features/auth/authApi';
import { useGetAssignmentsQuery } from '../../features/questions/questionBankApi';
import EmployeeAnswerEditor from '../Questions/EmployeeAnswerEditor';
import '../Questions/Questions.css';

function getAssignmentQuestion(assignment) {
  const question = assignment.questions ?? assignment.question ?? {};
  const questionId = question.question_id ?? assignment.question_id;
  return question.question
    || question.question_text
    || question.title
    || (questionId != null ? `Question #${questionId}` : 'Untitled Question');
}

function getAssignmentQuestionId(assignment) {
  const question = assignment.questions ?? assignment.question ?? {};
  const id = question.question_id ?? assignment.question_id;
  if (id == null || id === '') return null;
  const numericId = Number(id);
  return Number.isInteger(numericId) ? numericId : null;
}

export default function AssignedQuestionsPage() {
  const { data, isLoading, isFetching, isError, error, refetch } = useGetAssignmentsQuery();
  const assignments = data?.assignments ?? data?.data?.assignments ?? [];
  const employee = data?.employee ?? data?.data?.employee;
  const assignmentCount = data?.count ?? assignments.length;

  return (
    <DashboardLayout
      title="Assigned Questions"
      eyebrow="Preparation"
      allowedRoles={['EMPLOYEE']}
    >
      <div className="qb-container">
        <div className="qb-header">
          <div className="qb-header__info">
            <h1>{employee ? `${employee.first_name || ''} ${employee.last_name || ''}`.trim() : 'Your assignments'}</h1>
            <p>{assignmentCount} {assignmentCount === 1 ? 'question' : 'questions'} assigned to you</p>
          </div>
          <button type="button" className="qb-page-btn" onClick={refetch} disabled={isFetching}>
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {isLoading ? (
          <div className="qb-state-card">
            <div className="qb-state-icon">
              <span className="upload-spinner" style={{ width: '28px', height: '28px', borderTopColor: '#0d9488' }} />
            </div>
            <h2>Loading assigned questions...</h2>
          </div>
        ) : isError ? (
          <div className="qb-state-card" role="alert">
            <h2>Unable to load your assignments</h2>
            <p>{getApiErrorMessage(error)}</p>
            <button type="button" className="qb-btn-upload" onClick={refetch}>Try again</button>
          </div>
        ) : assignments.length === 0 ? (
          <div className="qb-state-card qb-state-card--empty">
            <h2>No questions assigned yet</h2>
            <p>Questions assigned to you will appear here.</p>
          </div>
        ) : (
          <div className="qb-card qb-assignment-list">
            {assignments.map((assignment, index) => {
              const question = assignment.questions ?? assignment.question ?? {};
              const answerQuestionId = getAssignmentQuestionId(assignment);
              const framework = question.framework && question.framework.toLowerCase() !== 'nan'
                ? question.framework
                : null;
              const questionDetails = [
                ['Client', question.client_name],
                ['Difficulty', question.difficulty_level],
                ['Framework', framework],
                ['Cloud', question.cloud_platform],
              ].filter(([, value]) => value);

              return (
                <article className="qb-assignment-item" key={assignment.id || answerQuestionId || index}>
                  <span className="qb-assignment-number">{String(index + 1).padStart(2, '0')}</span>
                  <div className="qb-assignment-content">
                    <h2 className="qb-question-title">{getAssignmentQuestion(assignment)}</h2>
                    {questionDetails.length > 0 && (
                      <div className="qb-assignment-meta">
                        {questionDetails.map(([label, value]) => (
                          <span className="qb-assignment-tag" key={label}>
                            <strong>{label}</strong> {value}
                          </span>
                        ))}
                      </div>
                    )}
                    {answerQuestionId != null && (
                      <EmployeeAnswerEditor
                        questionId={answerQuestionId}
                        questionTitle={getAssignmentQuestion(assignment)}
                      />
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
