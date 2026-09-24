/** src/components/CTASection/CTASection.jsx */
import { Link } from 'react-router-dom';
import './CTASection.css';

const benefits = [
  { icon: '🎯', title: 'Curated Technical Tracks',  desc: 'Targeted interview questions, code snippets, and solutions organized by tech stack in a single hub.' },
  { icon: '⚡', title: 'Self-Paced Practice',         desc: 'Review questions at your own speed, test your knowledge, and mark items as prepared as you master them.' },
  { icon: '📊', title: 'Live Readiness Benchmarks',  desc: 'Objective completion percentage metrics ensure you know when you are fully prepared for client rounds.' },
  { icon: '🔖', title: 'Rapid Pre-Interview Recap',  desc: 'Filter, search, and bookmark key architecture and coding questions for quick review before your interview.' },
];

export default function CTASection() {
  return (
    <section className="cta-section" id="cta">
      <div className="cta__orb cta__orb--1" />
      <div className="cta__orb cta__orb--2" />

      <div className="container cta__inner">
        <div className="cta__left">
          <span className="section-label">✦ Career Readiness</span>
          <h2 className="cta__title">
            Ready to Ace Your Next
            <span className="gradient-text"> Technical Interview?</span>
          </h2>
          <p className="cta__desc">
            Equip yourself with a structured, trackable, and proven path to technical interview success.
            Master key concepts, track your progress, and walk into client discussions with confidence.
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
            <Link to="/login" className="btn-primary cta__btn-primary" id="cta-explore-btn">
              Start Preparing Now
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <a href="#how-it-works" className="btn-outline" id="cta-flow-btn">View Roadmap</a>
          </div>
        </div>

        <div className="cta__right">
          <div className="cta__card glass-card">
            <div className="cta__card-header">
              <div className="cta__header-icon">🚀</div>
              <div>
                <h3 className="cta__card-title">Your All-in-One Learning Hub</h3>
                <p className="cta__card-sub">Engineered for technical professionals & consultants</p>
              </div>
            </div>

            <div className="cta__value-list">
              {[
                { icon: '✅', text: 'Curated question repository for your target tech stack' },
                { icon: '✅', text: 'Clear explanations, edge cases & best-practice patterns' },
                { icon: '✅', text: 'Interactive status tags: Pending, In Progress, Prepared' },
                { icon: '✅', text: 'Personal readiness percentage and topic mastery tracking' },
                { icon: '✅', text: 'Fast multi-topic search & technology domain filters' },
                { icon: '✅', text: 'One-click bookmarking for rapid pre-interview revision' },
                { icon: '✅', text: 'Focused, distraction-free study environment' },
              ].map((item, i) => (
                <div className="cta__value-item" key={i}>
                  <span className="cta__value-check">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <div className="cta__card-footer">
              <div className="cta__roles">
                <div className="cta__role-pill cta__role-pill--employee">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M6 20v-2a6 6 0 0112 0v2"/>
                  </svg>
                  Employee Portal
                </div>
              </div>
              <p className="cta__card-note">Fast and secure login with your employee credentials</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
