/** src/components/CTASection/CTASection.jsx */
import './CTASection.css';

const benefits = [
  { icon: '🎯', title: 'One Place for Everything',  desc: 'All interview questions, assignments, and progress in a single platform — no scattered spreadsheets.' },
  { icon: '⚡', title: 'Instant Assignment',         desc: 'Admins assign questions to employees in seconds. Employees see their tasks immediately on login.' },
  { icon: '📊', title: 'Real-Time Progress',         desc: 'Completion rates update the moment an employee marks a question done. No manual reporting.' },
  { icon: '🔍', title: 'Smart Preparation',          desc: 'Employees search, filter, and bookmark questions to focus on exactly what their interview needs.' },
];

export default function CTASection() {
  return (
    <section className="cta-section" id="cta">
      <div className="cta__orb cta__orb--1" />
      <div className="cta__orb cta__orb--2" />

      <div className="container cta__inner">
        <div className="cta__left">
          <span className="section-label">✦ Get Started</span>
          <h2 className="cta__title">
            Ready to Transform
            <span className="gradient-text"> Interview Preparation?</span>
          </h2>
          <p className="cta__desc">
            Give your team a structured, trackable, and efficient path to client interview readiness.
            Admins stay in control. Employees stay focused.
          </p>

          <div className="cta__benefits">
            {benefits.map((b, i) => (
              <div className="cta__benefit" key={i}>
                <span className="cta__benefit-icon">{b.icon}</span>
                <div>
                  <p className="cta__benefit-title">{b.title}</p>
                  <p className="cta__benefit-desc">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="cta__actions">
            <a href="#features" className="btn-primary cta__btn-primary" id="cta-explore-btn">
              Explore Features
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <a href="#how-it-works" className="btn-outline" id="cta-flow-btn">View Workflow</a>
          </div>
        </div>

        <div className="cta__right">
          <div className="cta__card glass-card">
            <div className="cta__card-header">
              <div className="cta__header-icon">🚀</div>
              <div>
                <h3 className="cta__card-title">Everything in One Platform</h3>
                <p className="cta__card-sub">Designed for modern interview preparation teams</p>
              </div>
            </div>

            <div className="cta__value-list">
              {[
                { icon: '✅', text: 'Centralised question bank — no more scattered files' },
                { icon: '✅', text: 'Bulk employee & question imports via Excel' },
                { icon: '✅', text: 'Targeted question assignment per employee' },
                { icon: '✅', text: 'Employee-level progress and completion tracking' },
                { icon: '✅', text: 'Search and filter by technology or topic' },
                { icon: '✅', text: 'Bookmark important questions for quick review' },
                { icon: '✅', text: 'Role-based access — admins and employees separated' },
              ].map((item, i) => (
                <div className="cta__value-item" key={i}>
                  <span className="cta__value-check">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <div className="cta__card-footer">
              <div className="cta__roles">
                <div className="cta__role-pill cta__role-pill--admin">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M6 20v-2a6 6 0 0112 0v2"/>
                    <path d="M19 8l2 2-4 4" strokeLinecap="round"/>
                  </svg>
                  Admin Portal
                </div>
                <div className="cta__role-pill cta__role-pill--employee">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M6 20v-2a6 6 0 0112 0v2"/>
                  </svg>
                  Employee Portal
                </div>
              </div>
              <p className="cta__card-note">Secure role-based login for each user type</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
