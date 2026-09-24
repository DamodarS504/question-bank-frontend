/**
 * src/constants/roles.js
 * Domain pillars detailing how QuestionHub empowers employee interview readiness.
 */

export const CURRICULUM_BENEFITS = [
  'Expert-vetted interview questions matched to client demands',
  'Deep coverage across Python, Java, React, Cloud, SQL & System Design',
  'Real-world architecture, concurrency, and scalability scenarios',
  'Clear technical explanations and production-grade code solutions',
  'Categorized by difficulty from core fundamentals to senior design',
  'Updated continuously to match current industry hiring standards',
];

export const READINESS_BENEFITS = [
  'Personalized preparation workspace loaded with your target stack',
  'Instant self-assessment tags: In Progress, Prepared, or Review',
  'Category-wise mastery bars to uncover and eliminate blind spots',
  'One-click bookmarking for rapid pre-interview revision',
  'Instant search across all assigned questions by keyword or topic',
  'Objective readiness score to enter client rounds with total confidence',
];

// Backwards-compatible exports
export const ADMIN_CAPABILITIES = CURRICULUM_BENEFITS;
export const EMPLOYEE_CAPABILITIES = READINESS_BENEFITS;

