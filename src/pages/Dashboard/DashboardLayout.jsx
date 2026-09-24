import { useState, useEffect } from 'react';
import { Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout, setUser } from '../../features/auth/authSlice';
import { useGetProfileQuery, useLogoutApiMutation } from '../../features/auth/authApi';
import './Dashboard.css';

function HomeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" /><path d="M9 21v-7h6v7" /></svg>;
}

function UserIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
}

function LogoutIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-6" /></svg>;
}

function QuestionIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M9 7h6M9 11h4" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default function DashboardLayout({ children, title, eyebrow }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutApiMutation();
  const { data: profile, isLoading, isError } = useGetProfileQuery();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      dispatch(setUser(profile));
    }
  }, [profile, dispatch]);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
    }
    dispatch(logout());
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="dashboard-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', color: '#0d9488' }}>
        <p style={{ fontWeight: 600 }}>Loading workspace...</p>
      </div>
    );
  }

  if (isError) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <NavLink to="/dashboard" className="dashboard-brand">
          <span className="dashboard-brand__mark">Q</span>
          <span>Question<span>Hub</span></span>
        </NavLink>

        <nav className="dashboard-nav" aria-label="Main navigation">
          <p className="dashboard-nav__label">Workspace</p>
          <NavLink to="/dashboard" className={({ isActive }) => `dashboard-nav__link${isActive ? ' is-active' : ''}`}>
            <HomeIcon />
            Dashboard
          </NavLink>
          <NavLink to="/questions" className={({ isActive }) => `dashboard-nav__link${isActive ? ' is-active' : ''}`}>
            <QuestionIcon />
            Question Bank
          </NavLink>
          <NavLink to="/employees" className={({ isActive }) => `dashboard-nav__link${isActive ? ' is-active' : ''}`}>
            <UsersIcon />
            Employees
          </NavLink>
        </nav>

        <div className="dashboard-sidebar__bottom">
          <div className="dashboard-sidebar__note">
            <span className="dashboard-sidebar__note-dot" />
            <span>Workspace ready</span>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
          </div>
          <div className="dashboard-profile-menu">
            <button
              type="button"
              className="dashboard-avatar"
              aria-label="Open profile menu"
              aria-expanded={isProfileMenuOpen}
              onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
            >
              {profile?.first_name ? (
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{profile.first_name.charAt(0).toUpperCase()}</span>
              ) : (
                <UserIcon />
              )}
            </button>
            {isProfileMenuOpen && (
              <div className="dashboard-profile-dropdown">
                <NavLink to="/profile" onClick={() => setIsProfileMenuOpen(false)}>
                  <UserIcon />
                  Profile
                </NavLink>
                <button type="button" onClick={handleLogout}>
                  <LogoutIcon />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}