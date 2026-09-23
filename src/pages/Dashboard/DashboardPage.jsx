import DashboardLayout from './DashboardLayout';

const summaryCards = [
  { icon: '👥', label: 'Total Employees', helper: 'Grows with your team', tone: 'purple' },
  { icon: '📚', label: 'Total Questions', helper: 'Excel upload supported', tone: 'teal' },
  { icon: '🎯', label: 'Total Assignments', helper: 'Across all technologies', tone: 'mint' },
  { icon: '✓', label: 'Completed', helper: 'Updated in real-time', tone: 'green' },
  { icon: '⌛', label: 'Pending', helper: 'Tracked automatically', tone: 'amber' },
];

const recentActivity = [
  { initials: 'E1', role: 'Employee', action: 'Completed a Python Core section', time: 'Just now' },
  { initials: 'E2', role: 'Employee', action: 'Started a new SQL assignment', time: '15m ago' },
  { initials: 'AD', role: 'Admin', action: 'Uploaded a new question batch', time: '1h ago' },
  { initials: 'E3', role: 'Employee', action: 'Viewed a JavaScript section', time: '2h ago' },
];

export default function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard" eyebrow="Overview">
      <div className="dashboard-overview-grid">
        <section className="dashboard-stats" aria-label="Summary statistics">
          {summaryCards.map((card) => (
            <article className={`dashboard-stat-card dashboard-stat-card--${card.tone}`} key={card.label}>
              <span className="dashboard-stat-card__icon" aria-hidden="true">{card.icon}</span>
              <div>
                <span className="dashboard-stat-card__value">-</span>
                <h2>{card.label}</h2>
                <p>{card.helper}</p>
              </div>
            </article>
          ))}
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
                    <strong>{item.role}</strong>
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