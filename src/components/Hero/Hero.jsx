/** src/components/Hero/Hero.jsx */
import { useEffect, useRef } from 'react';
import './Hero.css';

const stats = [
  { value: 'Admin',    label: 'Manage & Assign Questions', icon: '🛠️' },
  { value: 'Employee', label: 'Study & Track Progress',    icon: '📖' },
  { value: '100%',     label: 'Progress Visibility',       icon: '📈' },
];

export default function Hero() {
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const { clientX, clientY, currentTarget } = e;
      const { width, height } = currentTarget.getBoundingClientRect();
      const x = (clientX / width - 0.5) * 20;
      const y = (clientY / height - 0.5) * 20;
      heroRef.current.style.setProperty('--mouse-x', `${x}px`);
      heroRef.current.style.setProperty('--mouse-y', `${y}px`);
    };
    const section = heroRef.current;
    if (section) section.addEventListener('mousemove', handleMouseMove);
    return () => { if (section) section.removeEventListener('mousemove', handleMouseMove); };
  }, []);

  return (
    <section className="hero" ref={heroRef} id="home">
      <div className="hero__orb hero__orb--1" />
      <div className="hero__orb hero__orb--2" />
      <div className="hero__orb hero__orb--3" />
      <div className="hero__grid" />

      <div className="container hero__inner">
        <div className="hero__content">
          <div className="hero__badge">
            <span className="hero__badge-dot" />
            Interview Preparation Platform
          </div>

          <h1 className="hero__title">
            One Platform for
            <span className="hero__title-gradient"> Interview Mastery</span>
          </h1>

          <p className="hero__description">
            Centralise your entire interview preparation workflow. Admins manage questions,
            employees, and assignments — employees study, track progress, and ace client interviews.
          </p>

          <div className="hero__actions">
            <a href="#features" className="btn-primary hero__btn-primary" id="hero-get-started">
              Explore Features
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <a href="#how-it-works" className="btn-outline hero__btn-outline" id="hero-how-it-works">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M10 8l6 4-6 4V8z" fill="currentColor"/>
              </svg>
              How It Works
            </a>
          </div>

          <div className="hero__stats">
            {stats.map((s, i) => (
              <div className="hero__stat" key={i}>
                <span className="hero__stat-icon">{s.icon}</span>
                <div>
                  <p className="hero__stat-value">{s.value}</p>
                  <p className="hero__stat-label">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__mockup">
            <div className="hero__mockup-bar">
              <span className="dot dot--red" />
              <span className="dot dot--yellow" />
              <span className="dot dot--green" />
              <span className="hero__mockup-url">questionhub.app / dashboard</span>
            </div>

            <div className="hero__mockup-body">
              <div className="mockup__sidebar">
                <div className="mockup__sidebar-logo">QH</div>
                {['Dashboard', 'Questions', 'Employees', 'Assignments', 'Progress'].map((item, i) => (
                  <div key={i} className={`mockup__sidebar-item ${i === 0 ? 'active' : ''}`}>
                    <span className="mockup__sidebar-dot" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mockup__main">
                <p className="mockup__greeting">Admin Dashboard</p>
                <div className="mockup__cards">
                  {[
                    { label: 'Total Questions', val: '248', color: '#0d9488' },
                    { label: 'Employees',        val: '32',  color: '#059669' },
                    { label: 'Completed',        val: '74%', color: '#34d399' },
                    { label: 'Pending',          val: '26%', color: '#f59e0b' },
                  ].map((c, i) => (
                    <div className="mockup__card" key={i} style={{ '--card-color': c.color }}>
                      <p className="mockup__card-val">{c.val}</p>
                      <p className="mockup__card-label">{c.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mockup__bar-chart">
                  <p className="mockup__chart-title">Preparation by Tech</p>
                  {[
                    { tech: 'Python', pct: 78 },
                    { tech: 'SQL',    pct: 62 },
                    { tech: 'Azure',  pct: 45 },
                    { tech: 'React',  pct: 89 },
                  ].map((b, i) => (
                    <div className="mockup__bar-row" key={i}>
                      <span>{b.tech}</span>
                      <div className="mockup__bar-track">
                        <div className="mockup__bar-fill" style={{ width: `${b.pct}%`, animationDelay: `${i * 0.2}s` }} />
                      </div>
                      <span>{b.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="hero__float-card hero__float-card--1 animate-float">
            <span className="hero__float-icon">✅</span>
            <div>
              <p className="hero__float-title">Assignment Complete</p>
              <p className="hero__float-sub">Python Core Track · 24 questions</p>
            </div>
          </div>
          <div className="hero__float-card hero__float-card--2 animate-float" style={{ animationDelay: '1.2s' }}>
            <span className="hero__float-icon">📤</span>
            <div>
              <p className="hero__float-title">Excel Uploaded</p>
              <p className="hero__float-sub">48 questions imported</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hero__scroll-indicator">
        <div className="hero__scroll-mouse">
          <div className="hero__scroll-dot" />
        </div>
        <p>Scroll to explore</p>
      </div>
    </section>
  );
}
