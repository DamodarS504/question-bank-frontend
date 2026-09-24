/** src/components/HowItWorks/HowItWorks.jsx */
import { EMPLOYEE_STEPS } from '../../constants/howItWorks';
import './HowItWorks.css';

export default function HowItWorks() {
  return (
    <section className="how-it-works section-alt" id="how-it-works">
      <div className="container">
        <div className="hiw__header">
          <span className="section-label">✦ Your Roadmap</span>
          <h2 className="section-title">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="section-subtitle">
            A structured, self-paced workflow designed to help you prepare smarter, track readiness, and excel in interviews.
          </p>
        </div>

        <div className="hiw__steps">
          {EMPLOYEE_STEPS.map((s, i) => (
            <div className="hiw__step" key={s.step} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="hiw__step-left">
                <div className="hiw__step-number">{s.step}</div>
                {i < EMPLOYEE_STEPS.length - 1 && <div className="hiw__step-line" />}
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
