import { Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { logout } from '../../features/auth/authSlice';
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

export default function DashboardLayout({ children, title, eyebrow }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!accessToken) {
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
              <UserIcon />
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