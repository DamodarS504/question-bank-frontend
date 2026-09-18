/** src/components/DashboardPreview/DashboardPreview.jsx */
import { useState } from 'react';
import './DashboardPreview.css';

const adminStats = [
  { label: 'Total Employees',   value: '—', icon: '👥', color: '#0d9488', delta: 'Grows with your team' },
  { label: 'Total Questions',   value: '—', icon: '📚', color: '#059669', delta: 'Excel upload supported' },
  { label: 'Total Assignments', value: '—', icon: '🎯', color: '#34d399', delta: 'Across all technologies' },
  { label: 'Completed',         value: '—', icon: '✅', color: '#10b981', delta: 'Updated in real-time' },
  { label: 'Pending',           value: '—', icon: '⏳', color: '#f59e0b', delta: 'Tracked automatically' },
];

const employeeStats = [
  { label: 'Assigned Questions', value: '—', icon: '📋', color: '#0d9488', delta: 'Set by your admin' },
  { label: 'Completed',          value: '—', icon: '✅', color: '#059669', delta: 'Mark as you prepare' },
  { label: 'Pending',            value: '—', icon: '⏳', color: '#f59e0b', delta: 'Stay on track' },
  { label: 'Completion',         value: '—', icon: '📈', color: '#34d399', delta: 'Live percentage' },
];

const recentActivity = [
  { role: 'Employee', action: 'Completed a Python Core section',  time: 'Just now', avatar: 'E1' },
  { role: 'Employee', action: 'Started a new SQL assignment',     time: '15m ago',  avatar: 'E2' },
  { role: 'Admin',    action: 'Uploaded a new question batch',    time: '1h ago',   avatar: 'AD' },
  { role: 'Employee', action: 'Bookmarked key questions',         time: '2h ago',   avatar: 'E3' },
];

export default function DashboardPreview() {
  const [view, setView] = useState('admin');
  const stats = view === 'admin' ? adminStats : employeeStats;

  return (
    <section className="dashboard-preview" id="dashboard">
      <div className="container">
        <div className="dp__header">
          <span className="section-label">✦ Dashboard Preview</span>
          <h2 className="section-title">
            Powerful <span className="gradient-text">Dashboards</span> for Every Role
          </h2>
          <p className="section-subtitle">
            Real-time metrics keep admins informed and employees motivated throughout their preparation journey.
          </p>
        </div>

        <div className="dp__toggle">
          <button id="dp-toggle-admin" className={`dp__toggle-btn ${view === 'admin' ? 'active' : ''}`} onClick={() => setView('admin')}>
            Admin Dashboard
          </button>
          <button id="dp-toggle-employee" className={`dp__toggle-btn ${view === 'employee' ? 'active' : ''}`} onClick={() => setView('employee')}>
            Employee Dashboard
          </button>
        </div>

        <div className="dp__layout">
          <div className="dp__stats" key={view}>
            {stats.map((s, i) => (
              <div className="dp__stat-card glass-card" key={s.label} style={{ '--stat-color': s.color, animationDelay: `${i * 0.08}s` }}>
                <div className="dp__stat-icon">{s.icon}</div>
                <div className="dp__stat-body">
                  <p className="dp__stat-value dp__stat-value--dash">{s.value}</p>
                  <p className="dp__stat-label">{s.label}</p>
                  <p className="dp__stat-delta">{s.delta}</p>
                </div>
                <div className="dp__stat-glow" />
              </div>
            ))}
          </div>

          <div className="dp__right">
            <div className="dp__ring-card glass-card">
              <h4 className="dp__ring-title">Overall Completion</h4>
              <div className="dp__ring-wrap">
                <svg className="dp__ring-svg" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(13,148,136,0.12)" strokeWidth="12"/>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="url(#ringGrad)" strokeWidth="12"
                    strokeLinecap="round" strokeDasharray="314" strokeDashoffset="78"
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
                  <span className="dp__ring-pct">Live</span>
                  <span className="dp__ring-sub">Updated in real-time</span>
                </div>
              </div>
            </div>

            {view === 'admin' && (
              <div className="dp__activity glass-card">
                <h4 className="dp__activity-title">Recent Activity</h4>
                <div className="dp__activity-list">
                  {recentActivity.map((a, i) => (
                    <div className="dp__activity-item" key={i}>
                      <div className="dp__activity-avatar">{a.avatar}</div>
                      <div className="dp__activity-body">
                        <p className="dp__activity-user">{a.role}</p>
                        <p className="dp__activity-action">{a.action}</p>
                      </div>
                      <span className="dp__activity-time">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {view === 'employee' && (
              <div className="dp__activity glass-card">
                <h4 className="dp__activity-title">My Preparation Topics</h4>
                <div className="dp__tech-list">
                  {[
                    { tech: 'Python Core',    label: 'In Progress',  color: '#0d9488' },
                    { tech: 'SQL & Databases', label: 'In Progress', color: '#059669' },
                    { tech: 'Azure Services', label: 'Not Started',  color: '#34d399' },
                  ].map((t, i) => (
                    <div className="dp__tech-row" key={i}>
                      <div className="dp__tech-info">
                        <span className="dp__tech-name">{t.tech}</span>
                        <span className="dp__tech-count">{t.label}</span>
                      </div>
                      <div className="dp__tech-bar">
                        <div className="dp__tech-fill" style={{ width: i === 2 ? '8%' : i === 1 ? '55%' : '80%', background: t.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
