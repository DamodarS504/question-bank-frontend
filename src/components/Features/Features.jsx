/** src/components/Features/Features.jsx */
import './Features.css';

const features = [
  {
    id: 'feature-curated-bank',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
        <path d="M8 7h8M8 11h6M8 15h4" strokeLinecap="round"/>
      </svg>
    ),
    color: '#0d9488',
    title: 'Curated Question Bank',
    description: 'Access expert-vetted interview questions categorized by technology, difficulty level, and core architectural topics.',
  },
  {
    id: 'feature-tailored-tracks',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    color: '#059669',
    title: 'Tailored Skill Tracks',
    description: 'Focus on targeted preparation tracks aligned directly with your upcoming client interview requirements and role expectations.',
  },
  {
    id: 'feature-in-depth-answers',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    color: '#34d399',
    title: 'In-Depth Answers & Insights',
    description: 'Learn best practices with structured answers, sample code snippets, and key talking points that resonate with interviewers.',
  },
  {
    id: 'feature-search-filter',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <path d="M11 8v3l2 2" strokeLinecap="round"/>
      </svg>
    ),
    color: '#f59e0b',
    title: 'Smart Search & Multi-Filter',
    description: 'Find exact questions by keyword, filter across tech stacks (Python, Java, React, Cloud, SQL), and locate topics in milliseconds.',
  },
  {
    id: 'feature-progress',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
        <line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
    color: '#ec4899',
    title: 'Readiness Benchmarks',
    description: 'Watch your completion score climb in real-time. Know exactly when your preparation is solid and ready for the technical evaluation.',
  },
  {
    id: 'feature-bookmarks',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
      </svg>
    ),
    color: '#8b5cf6',
    title: 'Smart Bookmarks & Revision',
    description: 'Star challenging questions and complex patterns to assemble your own high-yield quick review deck right before interviews.',
  },
];

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="features__header">
          <span className="section-label">✦ Features</span>
          <h2 className="section-title">
            Everything you need for{' '}
            <span className="gradient-text">interview success</span>
          </h2>
          <p className="section-subtitle">
            A structured, self-paced workflow designed to help software engineers prepare, benchmark, and succeed.
          </p>
        </div>

        <div className="features__grid">
          {features.map((f) => (
            <div className="features__card glass-card" key={f.id} id={f.id}>
              <div className="features__icon-wrap" style={{ '--feature-color': f.color }}>
                {f.icon}
              </div>
              <h3 className="features__card-title">{f.title}</h3>
              <p className="features__card-desc">{f.description}</p>
              <div className="features__card-line" style={{ '--feature-color': f.color }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
