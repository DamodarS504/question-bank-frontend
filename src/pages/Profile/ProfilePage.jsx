import DashboardLayout from '../Dashboard/DashboardLayout';
import { getApiErrorMessage, useGetProfileQuery } from '../../features/auth/authApi';

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

  return (
    <DashboardLayout title="My profile" eyebrow="Account">
      {isLoading && <div className="profile-state">Loading your profile...</div>}
      {isError && <div className="profile-state profile-state--error" role="alert">{getApiErrorMessage(error)}</div>}
      {profile && (
        <section className="profile-content">
          <div className="profile-identity">
            <div className="profile-identity__avatar">{profile.first_name?.charAt(0).toUpperCase()}</div>
            <div>
              <p className="dashboard-eyebrow">Account profile</p>
              <h2>{profile.first_name} {profile.last_name || ''}</h2>
              <p>{profile.email}</p>
            </div>
            <span className="profile-role">{profile.role}</span>
          </div>

          <div className="profile-details">
            <div className="profile-details__heading">
              <p className="dashboard-eyebrow">Personal details</p>
              <h2>Profile information</h2>
            </div>
            <dl>
              <ProfileRow label="First name" value={profile.first_name} />
              <ProfileRow label="Last name" value={profile.last_name} />
              <ProfileRow label="Email address" value={profile.email} />
              <ProfileRow label="Employee ID" value={profile.employee_id} />
              <ProfileRow label="Base location" value={profile.base_location} />
              <ProfileRow label="Account status" value={profile.is_active ? 'Active' : 'Inactive'} />
            </dl>
          </div>
        </section>
      )}
    </DashboardLayout>
  );
}