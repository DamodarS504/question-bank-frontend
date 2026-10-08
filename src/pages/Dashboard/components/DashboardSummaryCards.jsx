/**
 * src/pages/Dashboard/components/DashboardSummaryCards.jsx
 * Clean, minimal KPI cards with reduced text for a neat executive look.
 */
import { Link } from 'react-router-dom';

function QuestionIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M9 7h6M9 11h4" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function UsersGroupIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BookmarkRibbonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function DashboardSummaryCards({
  totalQuestions = 0,
  assignedQuestions = 0,
  totalEmployees = 0,
  activeEmployees = 0,
  bookmarkedCount = 0,
  isLoading = false,
}) {
  const activeRate = totalEmployees > 0
    ? Math.round((activeEmployees / totalEmployees) * 100)
    : 0;

  return (
    <section className="dash-metrics-grid" aria-label="Key Performance Indicators">
      {/* 1. Total Questions */}
      <Link to="/questions" className="dash-metric-card" title="View Question Bank">
        <div className="dash-metric-card__header">
          <span className="dash-metric-icon dash-metric-icon--teal">
            <QuestionIcon />
          </span>
          <span className="dash-metric-tag dash-metric-tag--teal">Bank</span>
        </div>
        <div className="dash-metric-card__content">
          <span className="dash-metric-val">{isLoading ? '—' : totalQuestions}</span>
          <h3 className="dash-metric-title">Total Questions</h3>
        </div>
      </Link>

      {/* 2. Assigned Questions */}
      <div className="dash-metric-card">
        <div className="dash-metric-card__header">
          <span className="dash-metric-icon dash-metric-icon--indigo">
            <CheckCircleIcon />
          </span>
          <span className="dash-metric-tag dash-metric-tag--indigo">Active</span>
        </div>
        <div className="dash-metric-card__content">
          <span className="dash-metric-val">{isLoading ? '—' : assignedQuestions}</span>
          <h3 className="dash-metric-title">Assigned Questions</h3>
        </div>
      </div>

      {/* 3. Total Employees */}
      <Link to="/employees" className="dash-metric-card" title="View Employees Directory">
        <div className="dash-metric-card__header">
          <span className="dash-metric-icon dash-metric-icon--emerald">
            <UsersGroupIcon />
          </span>
          <span className="dash-metric-tag dash-metric-tag--emerald">{activeRate}% Active</span>
        </div>
        <div className="dash-metric-card__content">
          <span className="dash-metric-val">{isLoading ? '—' : totalEmployees}</span>
          <h3 className="dash-metric-title">Total Employees</h3>
        </div>
      </Link>

      {/* 4. Bookmarked Questions — Click goes to Bookmarks tab */}
      <Link to="/bookmarks" className="dash-metric-card" title="View Bookmarked Questions">
        <div className="dash-metric-card__header">
          <span className="dash-metric-icon dash-metric-icon--amber">
            <BookmarkRibbonIcon />
          </span>
          <span className="dash-metric-tag dash-metric-tag--amber">Saved</span>
        </div>
        <div className="dash-metric-card__content">
          <span className="dash-metric-val">{bookmarkedCount}</span>
          <h3 className="dash-metric-title">Bookmarked</h3>
        </div>
      </Link>
    </section>
  );
}
