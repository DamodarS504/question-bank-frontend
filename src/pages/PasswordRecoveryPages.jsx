import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getApiErrorMessage,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from '../features/auth/authApi';
import './AuthPages.css';

function RecoveryLayout({ title, description, children }) {
  return (
    <div className="auth-page">
      <aside className="auth-left">
        <div className="auth-left__inner">
          <Link to="/" className="auth-brand">
            <span className="auth-brand__icon">
              <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <rect width="28" height="28" rx="7" fill="rgba(255,255,255,0.2)" />
                <path d="M8 9h12M8 14h8M8 19h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span className="auth-brand__name">Question<span>Hub</span></span>
          </Link>
          <div className="auth-left__hero">
            <h1 className="auth-left__title">
              Account<br />
              <span className="auth-left__title-accent">recovery</span>
            </h1>
            <p className="auth-left__sub">{description}</p>
          </div>
          <div className="auth-left__employee-note">
            <span>Use a new, unique password to keep your account secure.</span>
          </div>
          <div className="auth-orb auth-orb--1" />
          <div className="auth-orb auth-orb--2" />
        </div>
      </aside>
      <main className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h2 className="auth-form-title">{title}</h2>
            <p className="auth-form-sub">{description}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

export function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetPath, setResetPath] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setResetPath('');

    try {
      const response = await forgotPassword({ email: email.trim() }).unwrap();
      setSuccess(response?.message || 'If the email matches an account, a reset link has been generated.');

      if (response?.reset_link) {
        let token = '';
        try {
          token = new URL(response.reset_link, window.location.origin).searchParams.get('token') || '';
        } catch {
          token = '';
        }
        if (token) {
          setResetPath(`/reset-password?token=${encodeURIComponent(token)}`);
        }
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  return (
    <RecoveryLayout
      title="Forgot password?"
      description="Enter your account email and we will help you reset your password."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="auth-form-alert" role="alert">{error}</div>}
        {success && <div className="auth-form-alert auth-form-alert--success" role="status">{success}</div>}
        {resetPath && (
          <Link className="auth-admin-register-btn" to={resetPath}>
            Continue to reset password
          </Link>
        )}
        <div className="auth-field">
          <label className="auth-label" htmlFor="recovery-email">Email address</label>
          <input
            id="recovery-email"
            type="email"
            name="email"
            className="auth-input"
            placeholder="you@company.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-submit-btn" disabled={isLoading}>
          {isLoading ? <span className="auth-spinner" /> : 'Send reset link'}
        </button>
      </form>
      <Link to="/login" className="auth-link">Back to sign in</Link>
    </RecoveryLayout>
  );
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = searchParams.get('token') || '';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8 || !/(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setError('Password must be at least 8 characters and include an uppercase letter and a number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await resetPassword({ token, new_password: newPassword }).unwrap();
      setSuccess(response?.message || 'Your password has been reset successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  return (
    <RecoveryLayout
      title="Set a new password"
      description="Choose a new password for your account."
    >
      {!token ? (
        <>
          <div className="auth-form-alert" role="alert">This reset link is missing its token or is invalid.</div>
          <Link to="/forgot-password" className="auth-admin-register-btn">Request another reset link</Link>
        </>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-form-alert" role="alert">{error}</div>}
          {success && <div className="auth-form-alert auth-form-alert--success" role="status">{success}</div>}
          {success ? (
            <Link to="/login" className="auth-admin-register-btn">Return to sign in</Link>
          ) : (
            <>
              <div className="auth-field">
                <label className="auth-label" htmlFor="reset-new-password">New password</label>
                <input
                  id="reset-new-password"
                  type="password"
                  className="auth-input"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="reset-confirm-password">Confirm new password</label>
                <input
                  id="reset-confirm-password"
                  type="password"
                  className="auth-input"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? <span className="auth-spinner" /> : 'Reset password'}
              </button>
            </>
          )}
        </form>
      )}
      {!success && <Link to="/login" className="auth-link">Back to sign in</Link>}
    </RecoveryLayout>
  );
}
