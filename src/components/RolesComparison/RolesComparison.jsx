/** src/components/RolesComparison/RolesComparison.jsx */
import { CURRICULUM_BENEFITS, READINESS_BENEFITS } from '../../constants/roles';
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
    <section className="roles" id="benefits">
      <div className="container">
        <div className="roles__header">
          <span className="section-label">✦ Employee Advantage</span>
          <h2 className="section-title">
            The Two Pillars of <span className="gradient-text">Interview Success</span>
          </h2>
          <p className="section-subtitle">
            Curated, high-yield technical curriculum paired with interactive readiness tracking gives you the edge in every technical evaluation.
          </p>
        </div>

        <div className="roles__grid">
          <div className="roles__card roles__card--admin glass-card" id="benefits-curriculum-card">
            <div className="roles__card-header">
              <div className="roles__avatar roles__avatar--admin">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                  <path d="M8 7h8M8 11h6" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="roles__role-label">Curriculum</div>
                <h3 className="roles__role-name">Targeted Knowledge</h3>
                <p className="roles__role-sub">Vetted questions & clear solutions</p>
              </div>
              <div className="roles__access-badge roles__access-badge--admin">High Yield</div>
            </div>
            <ul className="roles__list">
              {CURRICULUM_BENEFITS.map((cap, i) => (
                <li className="roles__list-item" key={i}>
                  <CheckIcon color="#0d9488" />
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="roles__vs">
            <div className="roles__vs-line" />
            <div className="roles__vs-badge">+</div>
            <div className="roles__vs-line" />
          </div>

          <div className="roles__card roles__card--employee glass-card" id="benefits-readiness-card">
            <div className="roles__card-header">
              <div className="roles__avatar roles__avatar--employee">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="roles__role-label">Tracking</div>
                <h3 className="roles__role-name">Interactive Readiness</h3>
                <p className="roles__role-sub">Self-paced mastery & confidence</p>
              </div>
              <div className="roles__access-badge roles__access-badge--employee">Live Metrics</div>
            </div>
            <ul className="roles__list">
              {READINESS_BENEFITS.map((cap, i) => (
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
