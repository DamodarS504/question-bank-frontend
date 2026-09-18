/** src/components/HowItWorks/HowItWorks.jsx */
import { useState } from 'react';
import { ADMIN_STEPS, EMPLOYEE_STEPS } from '../../constants/howItWorks';
import './HowItWorks.css';

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState('admin');
  const steps = activeTab === 'admin' ? ADMIN_STEPS : EMPLOYEE_STEPS;

  return (
    <section className="how-it-works section-alt" id="how-it-works">
      <div className="container">
        <div className="hiw__header">
          <span className="section-label">✦ Workflow</span>
          <h2 className="section-title">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="section-subtitle">
            Two streamlined workflows — one for admins who manage, one for employees who prepare.
          </p>
        </div>

        <div className="hiw__tabs" role="tablist">
          <button
            id="tab-admin"
            role="tab"
            className={`hiw__tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
            aria-selected={activeTab === 'admin'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4"/>
              <path d="M6 20v-2a6 6 0 0112 0v2"/>
              <path d="M19 8l2 2-4 4" strokeLinecap="round"/>
            </svg>
            Admin Flow
          </button>
          <button
            id="tab-employee"
            role="tab"
            className={`hiw__tab ${activeTab === 'employee' ? 'active' : ''}`}
            onClick={() => setActiveTab('employee')}
            aria-selected={activeTab === 'employee'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4"/>
              <path d="M6 20v-2a6 6 0 0112 0v2"/>
            </svg>
            Employee Flow
          </button>
        </div>

        <div className="hiw__steps" key={activeTab}>
          {steps.map((s, i) => (
            <div className="hiw__step" key={s.step} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="hiw__step-left">
                <div className="hiw__step-number">{s.step}</div>
                {i < steps.length - 1 && <div className="hiw__step-line" />}
              </div>
              <div className="hiw__step-content glass-card">
                <div className="hiw__step-icon">{s.icon}</div>
                <div>
                  <h3 className="hiw__step-title">{s.title}</h3>
                  <p className="hiw__step-desc">{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
