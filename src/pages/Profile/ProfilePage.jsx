import { useState, useEffect } from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import {
  getApiErrorMessage,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '../../features/auth/authApi';
import ChangePasswordModal from './ChangePasswordModal';
import './Profile.css';

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="profile-row">
      <dt>{label}</dt>
      <dd>{value || 'Not provided'}</dd>
    </div>
  );
}

export default function ProfilePage() {
  const { data: profile, isLoading, isError, error } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    employee_id: '',
    base_location: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        employee_id: profile.employee_id || '',
        base_location: profile.base_location || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (saveError) setSaveError('');
    if (saveSuccess) setSaveSuccess('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess('');

    try {
      await updateProfile({
        employee_id: form.employee_id.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        base_location: form.base_location.trim(),
      }).unwrap();

      setSaveSuccess('Profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      setSaveError(getApiErrorMessage(err));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError('');
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        employee_id: profile.employee_id || '',
        base_location: profile.base_location || '',
      });
    }
  };

  return (
    <DashboardLayout title="My profile" eyebrow="Account">
      {isLoading && <div className="profile-state">Loading your profile...</div>}
      {isError && <div className="profile-state profile-state--error" role="alert">{getApiErrorMessage(error)}</div>}
      {profile && (
        <section className="profile-content">
          {/* Identity Column */}
          <div className="profile-identity">
            <div className="profile-identity__avatar">{profile.first_name?.charAt(0).toUpperCase()}</div>
            <div>
              <p className="dashboard-eyebrow">Account profile</p>
              <h2>{profile.first_name} {profile.last_name || ''}</h2>
              <p>{profile.email}</p>
            </div>
            <span className="profile-role">{profile.role}</span>
          </div>

          {/* Personal Details Card */}
          <div className="profile-details">
            <div className="profile-details__header">
              <div>
                <p className="dashboard-eyebrow">Personal details</p>
                <h2>Profile information</h2>
              </div>
              <div className="profile-details__actions">
                <button
                  type="button"
                  className="profile-btn-password"
                  onClick={() => setIsPasswordModalOpen(true)}
                >
                  <LockIcon />
                  Change Password
                </button>
                {!isEditing && (
                  <button
                    type="button"
                    className="profile-btn-edit"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {saveSuccess && (
              <div className="profile-alert-success">
                {saveSuccess}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSave} className="profile-edit-form">
                {saveError && (
                  <div className="profile-alert-error" role="alert">
                    {saveError}
                  </div>
                )}
                <div className="profile-form-grid">
                  <div className="auth-field">
                    <label className="auth-label">First name</label>
                    <input
                      type="text"
                      name="first_name"
                      className="auth-input"
                      value={form.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Last name</label>
                    <input
                      type="text"
                      name="last_name"
                      className="auth-input"
                      value={form.last_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Employee ID</label>
                    <input
                      type="text"
                      name="employee_id"
                      className="auth-input"
                      value={form.employee_id}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Base location</label>
                    <input
                      type="text"
                      name="base_location"
                      className="auth-input"
                      value={form.base_location}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="profile-form-actions">
                  <button
                    type="button"
                    className="profile-btn-cancel"
                    onClick={handleCancel}
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="profile-btn-save"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <dl>
                <ProfileRow label="First name" value={profile.first_name} />
                <ProfileRow label="Last name" value={profile.last_name} />
                <ProfileRow label="Email address" value={profile.email} />
                <ProfileRow label="Employee ID" value={profile.employee_id} />
                <ProfileRow label="Base location" value={profile.base_location} />
                <ProfileRow label="Account status" value={profile.is_active ? 'Active' : 'Inactive'} />
              </dl>
            )}
          </div>
        </section>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </DashboardLayout>
  );
}