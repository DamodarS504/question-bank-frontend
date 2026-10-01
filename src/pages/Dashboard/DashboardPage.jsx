import { Link } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { getUserRole } from '../../features/auth/authSlice';
import { useGetProfileQuery } from '../../features/auth/authApi';
import { useGetQuestionsQuery } from '../../features/questions/questionBankApi';

function getQuestionCount(data) {
  if (!data) return 0;
  if (typeof data.total === 'number') return data.total;
  if (typeof data.total_records === 'number') return data.total_records;
  if (typeof data.total_count === 'number') return data.total_count;
  if (typeof data.count === 'number') return data.count;
  if (Array.isArray(data)) return data.length;
  if (Array.isArray(data.questions)) return data.questions.length;
  if (Array.isArray(data.items)) return data.items.length;
  if (Array.isArray(data.data)) return data.data.length;
  if (Array.isArray(data.results)) return data.results.length;
  return 0;
}

const summaryCards = [
  { key: 'total-questions', icon: '📋', label: 'Total Questions', helper: 'Available in bank', tone: 'purple' },
  { key: 'assigned-questions', icon: '✓', label: 'Assigned Questions', helper: 'Assigend to employees', tone: 'green' },
  { key: 'total-employees', icon: '⌛', label: 'Total Employees', helper: 'Active employees', tone: 'amber' },
  { key: 'saved', icon: '🔖', label: 'Bookmarked', helper: 'Saved for quick review', tone: 'teal' },
];

export default function DashboardPage() {
  const { data: profile } = useGetProfileQuery();
  const isAdmin = getUserRole(profile) === 'ADMIN';
  const { data: questionsData } = useGetQuestionsQuery(undefined, { skip: !isAdmin });
  const totalQuestions = getQuestionCount(questionsData);

  return (
    <DashboardLayout title="Dashboard" eyebrow="Overview">
      <div className="dashboard-overview-grid">
        <section className="dashboard-stats" aria-label="Summary statistics">
          {summaryCards.map((card) => {
            const val = isAdmin && card.key === 'questions' ? (totalQuestions || '-') : '-';
            return (
              <article className={`dashboard-stat-card dashboard-stat-card--${card.tone}`} key={card.label}>
                <span className="dashboard-stat-card__icon" aria-hidden="true">{card.icon}</span>
                <div>
                  <span className="dashboard-stat-card__value">{val}</span>
                  <h2>{card.label}</h2>
                  <p>{card.helper}</p>
                </div>
              </article>
            );
          })}

          {!isAdmin && (
            <article className="dashboard-stat-card dashboard-stat-card--teal dashboard-stat-card--dashed">
              <span className="dashboard-stat-card__icon" aria-hidden="true">📋</span>
              <div>
                <span className="dashboard-stat-card__value">
                  <Link to="/assigned-questions" className="dashboard-card-link">
                    View assignments &rarr;
                  </Link>
                </span>
                <h2>Assigned Questions</h2>
                <p>Questions selected for your preparation</p>
              </div>
            </article>
          )}
        </section>

        {isAdmin ? <aside className="dashboard-side-column">
          <section className="dashboard-panel dashboard-completion" aria-labelledby="completion-title">
            <h2 id="completion-title">Overall Completion</h2>
            <div className="completion-ring" aria-label="Completion data unavailable">
              <div className="completion-ring__inner">
                <strong>Live</strong>
                <span>Updated in real-time</span>
              </div>
            </div>
          </section>

        </aside> : <aside className="dashboard-side-column">
          <section className="dashboard-panel dashboard-activity" aria-labelledby="assignments-title">
            <h2 id="assignments-title">Your preparation</h2>
            <p>Open Assigned Questions to review the questions selected for you.</p>
          </section>
        </aside>}
      </div>
    </DashboardLayout>
  );
}