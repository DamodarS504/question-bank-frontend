/** src/components/RolesComparison/RolesComparison.jsx */
import { ADMIN_CAPABILITIES, EMPLOYEE_CAPABILITIES } from '../../constants/roles';
import './RolesComparison.css';

function CheckIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function RolesComparison() {
  return (
    <section className="roles" id="roles">
      <div className="container">
        <div className="roles__header">
          <span className="section-label">✦ User Roles</span>
          <h2 className="section-title">
            Two Roles, <span className="gradient-text">One Platform</span>
          </h2>
          <p className="section-subtitle">
            Purpose-built experiences for every user — admins have full control, employees stay focused on preparation.
          </p>
        </div>

        <div className="roles__grid">
          <div className="roles__card roles__card--admin glass-card" id="roles-admin-card">
            <div className="roles__card-header">
              <div className="roles__avatar roles__avatar--admin">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M6 20v-2a6 6 0 0112 0v2"/>
                  <path d="M19 8l2 2-4 4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="roles__role-label">Role</div>
                <h3 className="roles__role-name">Administrator</h3>
                <p className="roles__role-sub">Full platform control</p>
              </div>
              <div className="roles__access-badge roles__access-badge--admin">Full Access</div>
            </div>
            <ul className="roles__list">
              {ADMIN_CAPABILITIES.map((cap, i) => (
                <li className="roles__list-item" key={i}>
                  <CheckIcon color="#0d9488" />
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="roles__vs">
            <div className="roles__vs-line" />
            <div className="roles__vs-badge">VS</div>
            <div className="roles__vs-line" />
          </div>

          <div className="roles__card roles__card--employee glass-card" id="roles-employee-card">
            <div className="roles__card-header">
              <div className="roles__avatar roles__avatar--employee">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M6 20v-2a6 6 0 0112 0v2"/>
                </svg>
              </div>
              <div>
                <div className="roles__role-label">Role</div>
                <h3 className="roles__role-name">Employee</h3>
                <p className="roles__role-sub">Focused preparation experience</p>
              </div>
              <div className="roles__access-badge roles__access-badge--employee">Assigned Access</div>
            </div>
            <ul className="roles__list">
              {EMPLOYEE_CAPABILITIES.map((cap, i) => (
                <li className="roles__list-item" key={i}>
                  <CheckIcon color="#059669" />
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
