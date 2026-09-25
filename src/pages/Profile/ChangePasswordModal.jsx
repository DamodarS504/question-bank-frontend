import { useState, useEffect } from 'react';
import { getApiErrorMessage, useChangePasswordMutation } from '../../features/auth/authApi';
import './ChangePasswordModal.css';

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [form, setForm] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* Reset form when modal closes/opens */
  useEffect(() => {
    if (!isOpen) {
      setForm({ old_password: '', new_password: '', confirm_new_password: '' });
      setErrors({});
      setApiError('');
      setIsSuccess(false);
      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [isOpen]);

  /* Close on Escape key */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const getPasswordStrength = () => {
    const p = form.new_password;
    if (!p) return { level: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: '#f43f5e' };
    if (score === 2) return { level: 2, label: 'Fair', color: '#f59e0b' };
    if (score === 3) return { level: 3, label: 'Good', color: '#0d9488' };
    return { level: 4, label: 'Strong', color: '#059669' };
  };

  const strength = getPasswordStrength();

  const validate = () => {
    const errs = {};
    if (!form.old_password) {
      errs.old_password = 'Current password is required';
    }

    if (!form.new_password) {
      errs.new_password = 'New password is required';
    } else if (form.new_password.length < 8) {
      errs.new_password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[A-Z])(?=.*\d)/.test(form.new_password)) {
      errs.new_password = 'Must include at least one uppercase letter and one number';
    } else if (form.old_password && form.new_password === form.old_password) {
      errs.new_password = 'New password must be different from current password';
    }

    if (!form.confirm_new_password) {
      errs.confirm_new_password = 'Confirm password is required';
    } else if (form.new_password !== form.confirm_new_password) {
      errs.confirm_new_password = 'Passwords do not match';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    try {
      await changePassword({
        old_password: form.old_password,
        new_password: form.new_password,
        confirm_new_password: form.confirm_new_password,
      }).unwrap();

      setIsSuccess(true);
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  };

  return (
    <div
      className="change-pwd-overlay"
      onClick={!isLoading ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-modal-title"
    >
      <div className="change-pwd-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="change-pwd-header">
          <div className="change-pwd-header__title-group">
            <div className="change-pwd-header__icon">
              <LockIcon />
            </div>
            <div>
              <h2 id="change-password-modal-title">Change Password</h2>
              <p>Keep your account secure with a strong password</p>
            </div>
          </div>
          <button
            type="button"
            className="change-pwd-close-btn"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close dialog"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Modal Content */}
        {isSuccess ? (
          <div className="change-pwd-body">
            <div className="change-pwd-success-view">
              <div className="change-pwd-success-icon">
                <CheckCircleIcon />
              </div>
              <h3>Password Updated!</h3>
              <p>Your password has been changed successfully. You can use your new password for your next login.</p>
            </div>
            <div className="change-pwd-footer" style={{ padding: '0 0 8px 0', background: 'transparent', borderTop: 'none', justifyContent: 'center' }}>
              <button
                type="button"
                className="change-pwd-btn-submit"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="change-pwd-body">
              {apiError && (
                <div className="change-pwd-alert-error" role="alert">
                  <AlertCircleIcon />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Current Password */}
              <div className="change-pwd-field">
                <label className="change-pwd-label" htmlFor="modal-old-password">
                  Current password *
                </label>
                <div className="change-pwd-input-wrap">
                  <input
                    id="modal-old-password"
                    type={showOld ? 'text' : 'password'}
                    name="old_password"
                    className={`change-pwd-input ${errors.old_password ? 'change-pwd-input--error' : ''}`}
                    placeholder="Enter current password"
                    value={form.old_password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="change-pwd-eye-btn"
                    onClick={() => setShowOld((prev) => !prev)}
                    aria-label={showOld ? 'Hide current password' : 'Show current password'}
                  >
                    {showOld ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.old_password && (
                  <p className="change-pwd-field-error" role="alert">{errors.old_password}</p>
                )}
              </div>

              {/* New Password */}
              <div className="change-pwd-field">
                <label className="change-pwd-label" htmlFor="modal-new-password">
                  New password *
                </label>
                <div className="change-pwd-input-wrap">
                  <input
                    id="modal-new-password"
                    type={showNew ? 'text' : 'password'}
                    name="new_password"
                    className={`change-pwd-input ${errors.new_password ? 'change-pwd-input--error' : ''}`}
                    placeholder="Min. 8 characters"
                    value={form.new_password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="change-pwd-eye-btn"
                    onClick={() => setShowNew((prev) => !prev)}
                    aria-label={showNew ? 'Hide new password' : 'Show new password'}
                  >
                    {showNew ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.new_password && (
                  <p className="change-pwd-field-error" role="alert">{errors.new_password}</p>
                )}

                {/* Password strength meter */}
                {form.new_password && (
                  <div className="change-pwd-strength">
                    <div className="change-pwd-strength-bars">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className="change-pwd-strength-bar"
                          style={{
                            background: n <= strength.level ? strength.color : '#e2e8f0',
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className="change-pwd-strength-label"
                      style={{ color: strength.color }}
                    >
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="change-pwd-field">
                <label className="change-pwd-label" htmlFor="modal-confirm-password">
                  Confirm new password *
                </label>
                <div className="change-pwd-input-wrap">
                  <input
                    id="modal-confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    name="confirm_new_password"
                    className={`change-pwd-input ${errors.confirm_new_password ? 'change-pwd-input--error' : ''}`}
                    placeholder="Re-enter new password"
                    value={form.confirm_new_password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="change-pwd-eye-btn"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.confirm_new_password && (
                  <p className="change-pwd-field-error" role="alert">{errors.confirm_new_password}</p>
                )}
                {form.confirm_new_password && (
                  <p
                    className={`change-pwd-match-hint ${
                      form.new_password === form.confirm_new_password
                        ? 'change-pwd-match-hint--match'
                        : 'change-pwd-match-hint--mismatch'
                    }`}
                  >
                    {form.new_password === form.confirm_new_password
                      ? '✓ Passwords match'
                      : '✕ Passwords do not match'}
                  </p>
                )}
              </div>

              {/* Rules checklist */}
              <div className="change-pwd-rules">
                <p className="change-pwd-rules-title">Password must include:</p>
                <ul className="change-pwd-rules-list">
                  <li className={form.new_password.length >= 8 ? 'rule-met' : ''}>
                    <span>{form.new_password.length >= 8 ? '✓' : '•'}</span> At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(form.new_password) ? 'rule-met' : ''}>
                    <span>{/[A-Z]/.test(form.new_password) ? '✓' : '•'}</span> One uppercase letter
                  </li>
                  <li className={/\d/.test(form.new_password) ? 'rule-met' : ''}>
                    <span>{/\d/.test(form.new_password) ? '✓' : '•'}</span> One number
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="change-pwd-footer">
              <button
                type="button"
                className="change-pwd-btn-cancel"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="change-pwd-btn-submit"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
