import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPages.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsLoading(true);
    // TODO: replace with real API call
    // The backend will return the user role (admin/employee) and redirect accordingly
    await new Promise((r) => setTimeout(r, 1400));
    setIsLoading(false);
    navigate('/');
  };

  return (
    <div className="auth-page" id="login-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left__inner">
          {/* Logo */}
          <Link to="/" className="auth-brand" id="auth-logo-login">
            <div className="auth-brand__icon">
              <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="28" height="28" rx="7" fill="url(#authLogoGrad1)" />
                <path d="M8 9h12M8 14h8M8 19h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="20" cy="19" r="2.5" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
                <defs>
                  <linearGradient id="authLogoGrad1" x1="0" y1="0" x2="28" y2="28">
                    <stop stopColor="rgba(255,255,255,0.3)" />
                    <stop offset="1" stopColor="rgba(255,255,255,0.05)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="auth-brand__name">Question<span>Hub</span></span>
          </Link>

          {/* Headline */}
          <div className="auth-left__hero">
            <h1 className="auth-left__title">
              Welcome back to<br />
              <span className="auth-left__title-accent">QuestionHub</span>
            </h1>
            <p className="auth-left__sub">
              Sign in to access your dashboard. Your role determines what you see after logging in.
            </p>
          </div>

          {/* Role info cards */}
          <div className="auth-left__roles">
            <div className="auth-role-info-card">
              <span className="auth-role-info-icon">🛠️</span>
              <div>
                <p className="auth-role-info-name">Admin</p>
                <p className="auth-role-info-desc">Manage employees, questions & assignments</p>
              </div>
            </div>
            <div className="auth-role-info-card">
              <span className="auth-role-info-icon">📖</span>
              <div>
                <p className="auth-role-info-name">Employee</p>
                <p className="auth-role-info-desc">Study assigned questions & track progress</p>
              </div>
            </div>
          </div>

          {/* Note for employees */}
          <div className="auth-left__employee-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Employee credentials are provided by your Admin. Contact your Admin if you don't have access.</span>
          </div>

          {/* Decorative orbs */}
          <div className="auth-orb auth-orb--1" />
          <div className="auth-orb auth-orb--2" />
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Sign in</h2>
            <p className="auth-form-sub">
              Use the credentials provided to you to sign in.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate id="login-form">
            {/* Email */}
            <div className={`auth-field ${errors.email ? 'auth-field--error' : ''}`}>
              <label className="auth-label" htmlFor="login-email">Email address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 8l10 6 10-6" />
                  </svg>
                </span>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  className="auth-input"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="auth-error" role="alert">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className={`auth-field ${errors.password ? 'auth-field--error' : ''}`}>
              <div className="auth-label-row">
                <label className="auth-label" htmlFor="login-password">Password</label>
                <a href="#" className="auth-forgot" id="login-forgot">Forgot password?</a>
              </div>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  id="login-toggle-password"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="auth-error" role="alert">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="auth-submit-btn"
              id="login-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  Sign in to Dashboard
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Admin signup link — only for admins */}
          <div className="auth-divider">
            <span>Are you an Admin setting up a new account?</span>
          </div>
          <Link to="/signup" className="auth-admin-register-btn" id="login-to-admin-signup">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Register as Admin
          </Link>

          <p className="auth-footer-note" style={{ marginTop: '16px' }}>
            By signing in you agree to our{' '}
            <a href="#" className="auth-link">Terms of Service</a> and{' '}
            <a href="#" className="auth-link">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
