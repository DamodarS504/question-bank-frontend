import { useMemo, useCallback } from 'react';
import DashboardLayout from './DashboardLayout';
import { getUserRole } from '../../features/auth/authSlice';
import { useGetProfileQuery } from '../../features/auth/authApi';
import { useGetAdminSummaryQuery } from '../../features/dashboard/dashboardApi';
import { useGetEmployeesQuery } from '../../features/employees/employeesApi';
import { useBookmarks } from '../../utils/bookmarkStorage';

import DashboardSummaryCards from './components/DashboardSummaryCards';
import TechDistributionChart from './components/TechDistributionChart';
import EmployeeStatusChart from './components/EmployeeStatusChart';
import DifficultyBreakdown from './components/DifficultyBreakdown';
import OverallProgressChart from './components/OverallProgressChart';
import './Dashboard.css';

export default function DashboardPage() {
  const { data: profile } = useGetProfileQuery();
  const isAdmin = getUserRole(profile) === 'ADMIN';

  // Live Admin Summary Query (GET /api/v1/dashboard/admin-summary)
  const {
    data: adminSummaryData,
    isLoading: isLoadingSummary,
    isFetching: isFetchingSummary,
    refetch: refetchSummary,
  } = useGetAdminSummaryQuery(undefined, { skip: !isAdmin });

  // Optional: Employees query for competency distribution pills
  const {
    data: employeesData,
    isLoading: isLoadingEmployees,
    isFetching: isFetchingEmployees,
    refetch: refetchEmployees,
  } = useGetEmployeesQuery({ page: 1, size: 250 }, { skip: !isAdmin });

  const { bookmarkCount } = useBookmarks();

  const isRefreshing = isFetchingSummary || isFetchingEmployees;

  const handleRefreshAll = useCallback(() => {
    refetchSummary();
    refetchEmployees();
  }, [refetchSummary, refetchEmployees]);

  /* ----------------------------------------------------
     Normalize Admin Summary Data
     ---------------------------------------------------- */
  const summary = useMemo(() => {
    if (!adminSummaryData) return null;
    return adminSummaryData.data || adminSummaryData;
  }, [adminSummaryData]);

  // KPI Metrics
  const totalQuestionsCount = summary?.total_questions ?? 0;
  const totalAssignmentsCount = summary?.total_assignments ?? 0;
  const totalEmployeesCount = summary?.total_employees ?? 0;
  const activeEmployeesCount = summary?.active_employees ?? summary?.employee_status?.active?.count ?? 0;
  const inactiveEmployeesCount = summary?.inactive_employees ?? summary?.employee_status?.inactive?.count ?? 0;
  const bookmarkedCount = (summary?.bookmarked_questions != null && summary.bookmarked_questions > 0)
    ? summary.bookmarked_questions
    : bookmarkCount;

  // Assessment Progress Metrics
  const completedQuestions = summary?.completed_questions ?? 0;
  const inProgressQuestions = summary?.in_progress_questions ?? 0;
  const notStartedQuestions = summary?.not_started_questions ?? 0;
  const overallProgress = summary?.overall_progress ?? 0;

  /* ----------------------------------------------------
     Employee Competencies
     ---------------------------------------------------- */
  const employeeCompetencies = useMemo(() => {
    if (!employeesData) return [];
    const rawList = Array.isArray(employeesData)
      ? employeesData
      : Array.isArray(employeesData.data)
      ? employeesData.data
      : Array.isArray(employeesData.employees)
      ? employeesData.employees
      : [];

    const compMap = new Map();
    rawList.forEach((emp) => {
      const comp = emp.competency || emp.department || emp.role;
      if (comp) {
        compMap.set(comp, (compMap.get(comp) || 0) + 1);
      }
    });

    return Array.from(compMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [employeesData]);

  /* ----------------------------------------------------
     Questions by Technology Distribution
     ---------------------------------------------------- */
  const techDistributionData = useMemo(() => {
    if (summary?.questions_by_technology && Array.isArray(summary.questions_by_technology)) {
      return summary.questions_by_technology.map((item) => ({
        technology: item.technology,
        total: item.total_questions ?? item.total ?? 0,
        assigned: item.assigned_questions ?? item.assigned ?? 0,
      }));
    }
    return [];
  }, [summary]);

  /* ----------------------------------------------------
     Difficulty Breakdown
     ---------------------------------------------------- */
  const { easyCount, mediumCount, hardCount } = useMemo(() => {
    if (summary?.difficulty_distribution && Array.isArray(summary.difficulty_distribution)) {
      let easy = 0;
      let med = 0;
      let hard = 0;

      summary.difficulty_distribution.forEach((item) => {
        const diff = String(item.difficulty || '').toLowerCase();
        const cnt = Number(item.count) || 0;
        if (diff.includes('easy')) easy = cnt;
        else if (diff.includes('hard')) hard = cnt;
        else if (diff.includes('med')) med = cnt;
      });

      return { easyCount: easy, mediumCount: med, hardCount: hard };
    }
    return { easyCount: 0, mediumCount: 0, hardCount: 0 };
  }, [summary]);

  // Sync button in the header
  const syncHeaderAction = (
    <button
      type="button"
      className="dash-sync-btn"
      onClick={handleRefreshAll}
      disabled={isRefreshing}
      title="Sync analytics"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isRefreshing ? 'dash-spin-icon' : ''}
      >
        <path d="M23 4v6h-6" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
      {isRefreshing ? 'Syncing...' : 'Sync'}
    </button>
  );

  return (
    <DashboardLayout
      title="Dashboard"
      eyebrow="Overview"
      headerActions={syncHeaderAction}
    >
      <div className="dash-wrapper">
        {/* KPI Metrics Summary (Total Questions, Assigned, Employees, Bookmarked) */}
        <DashboardSummaryCards
          totalQuestions={totalQuestionsCount}
          assignedQuestions={totalAssignmentsCount}
          totalEmployees={totalEmployeesCount}
          activeEmployees={activeEmployeesCount}
          bookmarkedCount={bookmarkedCount}
          isLoading={isLoadingSummary}
        />

        {/* Unified 2x2 Grid: Equal Width & Height for all 4 Analytics Cards */}
        <div className="dash-charts-quad-grid">
          <TechDistributionChart
            techData={techDistributionData}
            isLoading={isLoadingSummary}
          />

          <EmployeeStatusChart
            activeCount={activeEmployeesCount}
            inactiveCount={inactiveEmployeesCount}
            competencies={employeeCompetencies}
            isLoading={isLoadingSummary || isLoadingEmployees}
          />

          <DifficultyBreakdown
            easyCount={easyCount}
            mediumCount={mediumCount}
            hardCount={hardCount}
            isLoading={isLoadingSummary}
          />

          <OverallProgressChart
            completedQuestions={completedQuestions}
            inProgressQuestions={inProgressQuestions}
            notStartedQuestions={notStartedQuestions}
            overallProgress={overallProgress}
            totalAssignments={totalAssignmentsCount}
            isLoading={isLoadingSummary}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}