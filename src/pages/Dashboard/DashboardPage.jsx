import { Link } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { useGetQuestionsQuery } from '../../features/questions/questionBankApi';
import { useGetProfileQuery } from '../../features/auth/authApi';

function getQuestionCount(data) {
  if (!data) return 0;
  if (Array.isArray(data)) return data.length;
  if (Array.isArray(data.questions)) return data.questions.length;
  if (Array.isArray(data.items)) return data.items.length;
  if (Array.isArray(data.data)) return data.data.length;
  if (Array.isArray(data.results)) return data.results.length;
  if (typeof data.count === 'number') return data.count;
  if (typeof data.total === 'number') return data.total;
  return 0;
}

const summaryCards = [
  { key: 'questions', icon: '📋', label: 'Assigned Questions', helper: 'Available in bank', tone: 'purple' },
  { key: 'prepared',  icon: '✓',  label: 'Prepared',           helper: 'Marked as mastered',   tone: 'green' },
  { key: 'progress',  icon: '⌛',  label: 'In Progress',        helper: 'Active practice track', tone: 'amber' },
  { key: 'saved',     icon: '🔖', label: 'Bookmarked',         helper: 'Saved for quick review', tone: 'teal' },
  { key: 'readiness', icon: '📈', label: 'Readiness Score',    helper: 'Client interview ready', tone: 'mint' },
];

const recentActivity = [
  { initials: 'PY', title: 'Python Track',     action: 'Completed Python Core section',        time: 'Just now' },
  { initials: 'SQL', title: 'Database Track',  action: 'Practiced Indexing & Query Tuning',    time: '15m ago' },
  { initials: 'SYS', title: 'Architecture',    action: 'Reviewed Microservices Design Patterns', time: '1h ago' },
  { initials: 'REA', title: 'Frontend Track',  action: 'Bookmarked React Hooks Deep-Dive',     time: '2h ago' },
];

export default function DashboardPage() {
  const { data: profile } = useGetProfileQuery();
  const employeeId = profile?.employee_id;
  const { data: questionsData } = useGetQuestionsQuery(
    employeeId ? { employee_id: employeeId } : undefined,
    { skip: !employeeId }
  );
  const totalQuestions = getQuestionCount(questionsData);

  return (
    <DashboardLayout title="Dashboard" eyebrow="Overview">
      <div className="dashboard-overview-grid">
        <section className="dashboard-stats" aria-label="Summary statistics">
          {summaryCards.map((card) => {
            const val = card.key === 'questions' ? (totalQuestions || '-') : '-';
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

          <article className="dashboard-stat-card dashboard-stat-card--teal dashboard-stat-card--dashed">
            <span className="dashboard-stat-card__icon" aria-hidden="true">📂</span>
            <div>
              <span className="dashboard-stat-card__value">
                <Link to="/questions" className="dashboard-card-link">
                  Go to Bank &rarr;
                </Link>
              </span>
              <h2>Question Bank</h2>
              <p>Upload files &amp; explore</p>
            </div>
          </article>

          <article className="dashboard-stat-card dashboard-stat-card--mint dashboard-stat-card--dashed">
            <span className="dashboard-stat-card__icon" aria-hidden="true">👥</span>
            <div>
              <span className="dashboard-stat-card__value">
                <Link to="/employees" className="dashboard-card-link">
                  Employees &rarr;
                </Link>
              </span>
              <h2>Employees</h2>
              <p>Upload &amp; manage directory</p>
            </div>
          </article>
        </section>

        <aside className="dashboard-side-column">
          <section className="dashboard-panel dashboard-completion" aria-labelledby="completion-title">
            <h2 id="completion-title">Overall Completion</h2>
            <div className="completion-ring" aria-label="Completion data unavailable">
              <div className="completion-ring__inner">
                <strong>Live</strong>
                <span>Updated in real-time</span>
              </div>
            </div>
          </section>

          <section className="dashboard-panel dashboard-activity" aria-labelledby="activity-title">
            <h2 id="activity-title">Recent Activity</h2>
            <div className="activity-list">
              {recentActivity.map((item) => (
                <div className="activity-item" key={`${item.initials}-${item.time}`}>
                  <span className="activity-item__avatar">{item.initials}</span>
                  <div className="activity-item__body">
                    <strong>{item.title}</strong>
                    <span>{item.action}</span>
                  </div>
                  <time>{item.time}</time>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </DashboardLayout>
  );
}