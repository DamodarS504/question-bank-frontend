/**
 * src/constants/features.js
 * Static data for the Features section.
 * Extracted here so Features.jsx stays purely presentational.
 */
export const FEATURES = [
  {
    id: 'feature-central-bank',
    icon: `<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
           <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
           <path d="M8 7h8M8 11h6M8 15h4" stroke-linecap="round"/>`,
    color: '#0d9488',
    title: 'Curated Question Bank',
    description:
      'Access expert-vetted technical interview questions categorized by technology, difficulty, and topic for focused preparation.',
  },
  {
    id: 'feature-personalized-tracks',
    icon: `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>`,
    color: '#059669',
    title: 'Tailored Skill Tracks',
    description:
      'Focus specifically on the competencies and technologies needed for your upcoming client discussions and internal evaluations.',
  },
  {
    id: 'feature-verified-answers',
    icon: `<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
    color: '#34d399',
    title: 'In-Depth Answers & Insights',
    description:
      'Learn best practices with structured answers, code snippets, and key talking points that resonate with technical interviewers.',
  },
  {
    id: 'feature-search-filter',
    icon: `<circle cx="11" cy="11" r="8"/>
           <line x1="21" y1="21" x2="16.65" y2="16.65"/>
           <path d="M11 8v3l2 2" stroke-linecap="round"/>`,
    color: '#f59e0b',
    title: 'Smart Search & Multi-Filter',
    description:
      'Find exact questions by keyword, filter across tech stacks (Python, Java, React, Cloud, SQL), and pinpoint key topics instantly.',
  },
  {
    id: 'feature-progress',
    icon: `<line x1="18" y1="20" x2="18" y2="10"/>
           <line x1="12" y1="20" x2="12" y2="4"/>
           <line x1="6" y1="20" x2="6" y2="14"/>
           <line x1="2" y1="20" x2="22" y2="20"/>`,
    color: '#ec4899',
    title: 'Readiness Benchmarks',
    description:
      'Watch your completion percentage grow in real-time. Know exactly when your preparation is solid and ready for the client round.',
  },
  {
    id: 'feature-bookmarks',
    icon: `<path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>`,
    color: '#8b5cf6',
    title: 'Smart Bookmarks & Revision',
    description:
      'Star challenging questions and complex architectural patterns to create your own high-yield quick review deck right before interviews.',
  },
];
