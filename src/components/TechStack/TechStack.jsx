/** src/components/TechStack/TechStack.jsx */
import './TechStack.css';

const techs = [
  {
    id: 'tech-react',
    name: 'React', version: 'v18', role: 'Frontend', color: '#61dafb',
    description: 'Component-based UI with hooks, state management, and dynamic routing for a seamless user experience.',
    icon: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="50" rx="45" ry="18" stroke="#61dafb" strokeWidth="4" fill="none"/>
        <ellipse cx="50" cy="50" rx="45" ry="18" stroke="#61dafb" strokeWidth="4" fill="none" transform="rotate(60 50 50)"/>
        <ellipse cx="50" cy="50" rx="45" ry="18" stroke="#61dafb" strokeWidth="4" fill="none" transform="rotate(120 50 50)"/>
        <circle cx="50" cy="50" r="7" fill="#61dafb"/>
      </svg>
    ),
    badges: ['JSX', 'Hooks', 'Router', 'Vite'],
  },
  {
    id: 'tech-fastapi',
    name: 'FastAPI', version: 'v0.115', role: 'Backend', color: '#009688',
    description: 'High-performance Python API framework with automatic docs, Pydantic validation, and async support.',
    icon: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" stroke="#009688" strokeWidth="4" fill="none"/>
        <path d="M50 30 L35 55 H50 L35 75" stroke="#009688" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="65" cy="42" r="3" fill="#009688"/>
      </svg>
    ),
    badges: ['REST API', 'Pydantic', 'Async', 'OpenAPI'],
  },
  {
    id: 'tech-postgresql',
    name: 'PostgreSQL', version: 'v16', role: 'Database', color: '#336791',
    description: 'Robust relational database storing users, questions, assignments, and progress with full ACID compliance.',
    icon: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="28" rx="32" ry="14" stroke="#336791" strokeWidth="4" fill="none"/>
        <path d="M18 28 V72 Q18 86 50 86 Q82 86 82 72 V28" stroke="#336791" strokeWidth="4" fill="none"/>
        <path d="M18 50 Q34 60 50 57 Q66 54 82 50" stroke="#336791" strokeWidth="3" strokeDasharray="4 3"/>
        <circle cx="68" cy="22" r="4" fill="#336791"/>
        <path d="M72 22 Q82 18 82 28" stroke="#336791" strokeWidth="3"/>
      </svg>
    ),
    badges: ['ACID', 'Relations', 'Indexes', 'JSONB'],
  },
  {
    id: 'tech-security',
    name: 'Authentication & Security', version: 'Enterprise', role: 'Security', color: '#d63aff',
    description: 'Enterprise-grade security ensuring authenticated sessions, encrypted credentials, and protected data access.',
    icon: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="45" width="60" height="42" rx="6" stroke="#d63aff" strokeWidth="4" fill="none"/>
        <path d="M33 45 V33 A17 17 0 0 1 67 33 V45" stroke="#d63aff" strokeWidth="4" fill="none"/>
        <circle cx="50" cy="66" r="6" fill="#d63aff"/>
        <line x1="50" y1="72" x2="50" y2="80" stroke="#d63aff" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
    badges: ['JWT Tokens', 'HttpOnly Cookie', 'Encrypted', 'Protected'],
  },
];

export default function TechStack() {
  return (
    <section className="tech-stack" id="tech-stack">
      <div className="container">
        <div className="ts__header">
          <span className="section-label">✦ Technology</span>
          <h2 className="section-title">
            Built on a <span className="gradient-text">Modern Stack</span>
          </h2>
          <p className="section-subtitle">
            Proven, production-ready technologies working together to deliver a fast, secure, and scalable platform.
          </p>
        </div>

        <div className="ts__grid">
          {techs.map((t) => (
            <div className="ts__card glass-card" key={t.id} id={t.id} style={{ '--tech-color': t.color }}>
              <div className="ts__card-top">
                <div className="ts__icon">{t.icon}</div>
                <div>
                  <div className="ts__role-badge">{t.role}</div>
                  <h3 className="ts__name">{t.name}</h3>
                  <span className="ts__version">{t.version}</span>
                </div>
              </div>
              <p className="ts__desc">{t.description}</p>
              <div className="ts__badges">
                {t.badges.map((b) => (
                  <span className="ts__badge" key={b}>{b}</span>
                ))}
              </div>
              <div className="ts__glow-bar" />
            </div>
          ))}
        </div>

        <div className="ts__arch-note glass-card">
          <div className="ts__arch-icon">🏗️</div>
          <div>
            <h4 className="ts__arch-title">Modular & Scalable Architecture</h4>
            <p className="ts__arch-desc">
              Structured architecture cleanly separating presentation, business logic, and persistent storage — clean, resilient, and enterprise-ready.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
