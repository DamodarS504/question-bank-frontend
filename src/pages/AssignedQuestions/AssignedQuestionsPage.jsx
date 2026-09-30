import DashboardLayout from '../Dashboard/DashboardLayout';
import { getApiErrorMessage } from '../../features/auth/authApi';
import { useGetAssignmentsQuery } from '../../features/questions/questionBankApi';
import '../Questions/Questions.css';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function getAssignmentQuestion(assignment) {
  const question = assignment.questions ?? assignment.question ?? {};
  const questionId = question.question_id ?? assignment.question_id;
  return question.question
    || question.question_text
    || question.title
    || (questionId != null ? `Question #${questionId}` : 'Untitled Question');
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
          <div className="qb-card">
            <div className="qb-table-wrap">
              <table className="qb-table qb-assignment-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Question</th>
                    <th>Assigned</th>
                    <th>Status</th>
                    <th>Bookmark</th>
                    <th>Last updated</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment, index) => {
                    const status = assignment.status || 'Not Started';
                    const statusClass = status.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    const question = assignment.questions ?? assignment.question ?? {};
                    const questionId = question.question_id ?? assignment.question_id;
                    const framework = question.framework && question.framework.toLowerCase() !== 'nan'
                      ? question.framework
                      : null;
                    const questionDetails = [
                      question.client_name && `Client: ${question.client_name}`,
                      question.difficulty_level && `Difficulty: ${question.difficulty_level}`,
                      framework && `Framework: ${framework}`,
                      question.cloud_platform && `Cloud: ${question.cloud_platform}`,
                    ].filter(Boolean);

                    return (
                      <tr key={assignment.id || `${questionId}-${index}`}>
                        <td className="qb-col-num">{index + 1}</td>
                        <td className="qb-col-question">
                          <p className="qb-question-title">{getAssignmentQuestion(assignment)}</p>
                          {questionDetails.length > 0 && (
                            <div className="qb-assignment-meta">
                              {questionDetails.map((detail) => <span key={detail}>{detail}</span>)}
                            </div>
                          )}
                          {questionId != null && (
                            <span className="qb-assignment-reference">Question ID: {questionId}</span>
                          )}
                        </td>
                        <td className="qb-created-date">{formatDate(assignment.assigned_date)}</td>
                        <td><span className={`qb-assignment-status qb-assignment-status--${statusClass}`}>{status}</span></td>
                        <td>{assignment.is_bookmark ? 'Bookmarked' : '—'}</td>
                        <td className="qb-created-date">{formatDate(assignment.updated_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
