/**
 * src/constants/howItWorks.js
 * Static step data for the HowItWorks section.
 */

export const ADMIN_STEPS = [
  {
    step: '01',
    title: 'Login as Admin',
    desc: 'Authenticate securely with your admin credentials. JWT token is issued and stored for session management.',
    icon: '🔐',
  },
  {
    step: '02',
    title: 'Upload Employees via Excel',
    desc: 'Import employee records in bulk using a structured Excel file. The system validates and deduplicates before saving.',
    icon: '📤',
  },
  {
    step: '03',
    title: 'Upload Interview Questions',
    desc: 'Add hundreds of questions with technology, difficulty, and answers via Excel. Or create them individually.',
    icon: '📚',
  },
  {
    step: '04',
    title: 'Assign Questions to Employees',
    desc: 'Select employees and assign specific questions or full question sets tailored to their upcoming interview.',
    icon: '🎯',
  },
  {
    step: '05',
    title: 'Monitor Progress',
    desc: 'Track completion rates per employee, view pending vs completed assignments, and see overall dashboard stats.',
    icon: '📊',
  },
];

export const EMPLOYEE_STEPS = [
  {
    step: '01',
    title: 'Login as Employee',
    desc: 'Securely log in with your credentials. Your personalised dashboard loads immediately with your assignments.',
    icon: '🔑',
  },
  {
    step: '02',
    title: 'View My Dashboard',
    desc: 'See your assigned questions, completion percentage, pending items, and overall preparation status at a glance.',
    icon: '🏠',
  },
  {
    step: '03',
    title: 'Search & Filter Questions',
    desc: 'Search questions by keyword or filter by technology (Python, SQL, Azure, etc.) to focus your preparation.',
    icon: '🔍',
  },
  {
    step: '04',
    title: 'Bookmark Key Questions',
    desc: 'Mark important or challenging questions for quick revisit. Your bookmarks persist across sessions.',
    icon: '🔖',
  },
  {
    step: '05',
    title: 'Update Preparation Status',
    desc: 'Mark questions as Prepared, In Progress, or Pending. Your progress updates in real-time on the admin dashboard.',
    icon: '✅',
  },
];
