/** src/components/DashboardPreview/DashboardPreview.jsx */
import './DashboardPreview.css';

const employeeStats = [
  { label: 'Assigned Questions', value: '248', icon: '📋', color: '#0d9488', delta: 'Curated for your profile' },
  { label: 'Prepared & Mastered', value: '184', icon: '✅', color: '#059669', delta: 'Ready for client questions' },
  { label: 'In Progress',        value: '46',  icon: '⏳', color: '#f59e0b', delta: 'Active practice track' },
  { label: 'Bookmarked for Review', value: '18', icon: '🔖', color: '#8b5cf6', delta: 'High-yield revision deck' },
];

const preparationTopics = [
  { tech: 'Python & Core Algorithms', label: '85% Prepared', pct: 85, color: '#0d9488' },
  { tech: 'SQL & Database Design',    label: '78% Prepared', pct: 78, color: '#059669' },
  { tech: 'Cloud & Microservices',    label: '70% Prepared', pct: 70, color: '#34d399' },
  { tech: 'React & Frontend Patterns', label: '92% Prepared', pct: 92, color: '#0284c7' },
];

export default function DashboardPreview() {
  return (
    <section className="dashboard-preview" id="dashboard">
      <div className="container">
        <div className="dp__header">
          <span className="section-label">✦ Personal Workspace</span>
          <h2 className="section-title">
            Your Personal <span className="gradient-text">Preparation Dashboard</span>
          </h2>
          <p className="section-subtitle">
            Live readiness metrics, category-by-category progress bars, and personal bookmarks give you total clarity before every interview.
          </p>
        </div>

        <div className="dp__layout">
          <div className="dp__stats">
            {employeeStats.map((s, i) => (
              <div className="dp__stat-card glass-card" key={s.label} style={{ '--stat-color': s.color, animationDelay: `${i * 0.08}s` }}>
                <div className="dp__stat-icon">{s.icon}</div>
                <div className="dp__stat-body">
                  <p className="dp__stat-value">{s.value}</p>
                  <p className="dp__stat-label">{s.label}</p>
                  <p className="dp__stat-delta">{s.delta}</p>
                </div>
                <div className="dp__stat-glow" />
              </div>
            ))}
          </div>

          <div className="dp__right">
            <div className="dp__ring-card glass-card">
              <h4 className="dp__ring-title">Client Interview Readiness</h4>
              <div className="dp__ring-wrap">
                <svg className="dp__ring-svg" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(13,148,136,0.12)" strokeWidth="12"/>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="url(#ringGrad)" strokeWidth="12"
                    strokeLinecap="round" strokeDasharray="314" strokeDashoffset="38"
                    className="dp__ring-progress" transform="rotate(-90 60 60)"
                  />
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%"   stopColor="#0d9488"/>
                      <stop offset="100%" stopColor="#059669"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="dp__ring-center">
                  <span className="dp__ring-pct">88%</span>
                  <span className="dp__ring-sub">Readiness Score</span>
                </div>
              </div>
            </div>

            <div className="dp__activity glass-card">
              <h4 className="dp__activity-title">Progress by Technology</h4>
              <div className="dp__tech-list">
                {preparationTopics.map((t, i) => (
                  <div className="dp__tech-row" key={i}>
                    <div className="dp__tech-info">
                      <span className="dp__tech-name">{t.tech}</span>
                      <span className="dp__tech-count">{t.label}</span>
                    </div>
                    <div className="dp__tech-bar">
                      <div className="dp__tech-fill" style={{ width: `${t.pct}%`, background: t.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
