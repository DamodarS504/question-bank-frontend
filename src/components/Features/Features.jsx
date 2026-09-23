/** src/components/Features/Features.jsx */
import './Features.css';

const features = [
  {
    id: 'feature-central-bank',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
        <path d="M8 7h8M8 11h6M8 15h4" strokeLinecap="round"/>
      </svg>
    ),
    color: '#0d9488',
    title: 'Central Question Bank',
    description: 'Store all interview questions in one organised place. Categorise by technology, difficulty, and topic for quick retrieval.',
  },
  {
    id: 'feature-role-access',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    color: '#059669',
    title: 'Role-Based Access',
    description: 'Two distinct roles — Admin and Employee. Admins manage questions and assignments; employees focus on their personalized preparation track.',
  },
  {
    id: 'feature-excel-upload',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
    ),
    color: '#34d399',
    title: 'Excel Bulk Upload',
    description: 'Import hundreds of questions and employee records in seconds via Excel. The system validates, deduplicates, and stores only clean data.',
  },
  {
    id: 'feature-search-filter',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <path d="M11 8v3l2 2" strokeLinecap="round"/>
      </svg>
    ),
    color: '#f59e0b',
    title: 'Smart Search & Filter',
    description: 'Employees can search questions by keyword, filter by technology stack, and quickly find what they need for their upcoming interview.',
  },
  {
    id: 'feature-progress',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
        <line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
    color: '#ec4899',
    title: 'Progress Tracking',
    description: 'Track preparation completion percentage per employee. Admins see real-time dashboards; employees see their personal progress at a glance.',
  },
  {
    id: 'feature-targeted-assignments',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    color: '#8b5cf6',
    title: 'Targeted Assignments',
    description: 'Admins can assign specific question sets tailored to individual employees based on their upcoming interview requirements.',
  },
];

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="features__header">
          <span className="section-label">✦ Features</span>
          <h2 className="section-title">
            Everything you need for{' '}
            <span className="gradient-text">interview success</span>
          </h2>
          <p className="section-subtitle">
            A complete workflow from question creation to employee readiness —
            all in one streamlined platform.
          </p>
        </div>

        <div className="features__grid">
          {features.map((f) => (
            <div className="features__card glass-card" key={f.id} id={f.id}>
              <div className="features__icon-wrap" style={{ '--feature-color': f.color }}>
                {f.icon}
              </div>
              <h3 className="features__card-title">{f.title}</h3>
              <p className="features__card-desc">{f.description}</p>
              <div className="features__card-line" style={{ '--feature-color': f.color }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
