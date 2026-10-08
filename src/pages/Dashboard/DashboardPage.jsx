/**
 * src/pages/Dashboard/DashboardPage.jsx
 * Clean, minimal Admin Dashboard with Chart.js visualization.
 */
import { useMemo, useCallback } from 'react';
import DashboardLayout from './DashboardLayout';
import { getUserRole } from '../../features/auth/authSlice';
import { useGetProfileQuery } from '../../features/auth/authApi';
import { useGetQuestionsQuery, useGetAssignmentsQuery } from '../../features/questions/questionBankApi';
import { useGetEmployeesQuery } from '../../features/employees/employeesApi';
import { useBookmarks } from '../../utils/bookmarkStorage';

import DashboardSummaryCards from './components/DashboardSummaryCards';
import TechDistributionChart from './components/TechDistributionChart';
import EmployeeStatusChart from './components/EmployeeStatusChart';
import DifficultyBreakdown from './components/DifficultyBreakdown';
import './Dashboard.css';

// Baseline demo distribution if questions database has 0 records
const DEFAULT_TECH_DISTRIBUTION = [
  { technology: 'Python', total: 32, assigned: 20 },
  { technology: 'React', total: 26, assigned: 18 },
  { technology: 'Java', total: 22, assigned: 14 },
  { technology: 'AWS Cloud', total: 16, assigned: 10 },
  { technology: 'JavaScript', total: 14, assigned: 11 },
  { technology: 'SQL & DB', total: 12, assigned: 8 },
  { technology: 'DevOps', total: 10, assigned: 6 },
  { technology: 'System Design', total: 8, assigned: 5 },
];

export default function DashboardPage() {
  const { data: profile } = useGetProfileQuery();
  const isAdmin = getUserRole(profile) === 'ADMIN';

  // Live API Queries
  const {
    data: questionsData,
    isLoading: isLoadingQuestions,
    isFetching: isFetchingQuestions,
    refetch: refetchQuestions,
  } = useGetQuestionsQuery({ page: 1, size: 250 }, { skip: !isAdmin });

  const {
    data: employeesData,
    isLoading: isLoadingEmployees,
    isFetching: isFetchingEmployees,
    refetch: refetchEmployees,
  } = useGetEmployeesQuery({ page: 1, size: 250 }, { skip: !isAdmin });

  const {
    data: assignmentsData,
    isLoading: isLoadingAssignments,
    isFetching: isFetchingAssignments,
    refetch: refetchAssignments,
  } = useGetAssignmentsQuery(undefined, { skip: !isAdmin });

  const { bookmarkCount } = useBookmarks();

  const isRefreshing = isFetchingQuestions || isFetchingEmployees || isFetchingAssignments;

  const handleRefreshAll = useCallback(() => {
    refetchQuestions();
    refetchEmployees();
    refetchAssignments();
  }, [refetchQuestions, refetchEmployees, refetchAssignments]);

  /* ----------------------------------------------------
     Normalize Questions
     ---------------------------------------------------- */
  const rawQuestions = useMemo(() => {
    if (!questionsData) return [];
    if (Array.isArray(questionsData)) return questionsData;
    if (Array.isArray(questionsData.data)) return questionsData.data;
    if (Array.isArray(questionsData.items)) return questionsData.items;
    if (Array.isArray(questionsData.questions)) return questionsData.questions;
    if (Array.isArray(questionsData.results)) return questionsData.results;
    return [];
  }, [questionsData]);

  const totalQuestionsCount = useMemo(() => {
    if (typeof questionsData?.total === 'number') return questionsData.total;
    if (typeof questionsData?.total_records === 'number') return questionsData.total_records;
    if (typeof questionsData?.total_count === 'number') return questionsData.total_count;
    if (typeof questionsData?.count === 'number') return questionsData.count;
    return rawQuestions.length;
  }, [questionsData, rawQuestions.length]);

  /* ----------------------------------------------------
     Normalize Assignments
     ---------------------------------------------------- */
  const rawAssignments = useMemo(() => {
    if (!assignmentsData) return [];
    if (Array.isArray(assignmentsData.assignments)) return assignmentsData.assignments;
    if (Array.isArray(assignmentsData.data?.assignments)) return assignmentsData.data.assignments;
    if (Array.isArray(assignmentsData.data)) return assignmentsData.data;
    if (Array.isArray(assignmentsData)) return assignmentsData;
    return [];
  }, [assignmentsData]);

  const totalAssignmentsCount = useMemo(() => {
    if (typeof assignmentsData?.count === 'number') return assignmentsData.count;
    if (typeof assignmentsData?.total === 'number') return assignmentsData.total;
    return rawAssignments.length;
  }, [assignmentsData, rawAssignments.length]);

  /* ----------------------------------------------------
     Normalize Employees
     ---------------------------------------------------- */
  const rawEmployees = useMemo(() => {
    if (!employeesData) return [];
    if (Array.isArray(employeesData.data)) return employeesData.data;
    if (Array.isArray(employeesData)) return employeesData;
    return [];
  }, [employeesData]);

  const totalEmployeesCount = useMemo(() => {
    if (typeof employeesData?.total_records === 'number') return employeesData.total_records;
    if (typeof employeesData?.total === 'number') return employeesData.total;
    return rawEmployees.length;
  }, [employeesData, rawEmployees.length]);

  const { activeEmployeesCount, inactiveEmployeesCount, employeeCompetencies } = useMemo(() => {
    if (rawEmployees.length === 0) {
      return {
        activeEmployeesCount: 0,
        inactiveEmployeesCount: 0,
        employeeCompetencies: [],
      };
    }

    let active = 0;
    let inactive = 0;
    const compMap = new Map();

    rawEmployees.forEach((emp) => {
      if (emp.is_active === false) {
        inactive += 1;
      } else {
        active += 1;
      }

      const comp = emp.competency || emp.department || emp.role;
      if (comp) {
        compMap.set(comp, (compMap.get(comp) || 0) + 1);
      }
    });

    const compList = Array.from(compMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      activeEmployeesCount: active,
      inactiveEmployeesCount: inactive,
      employeeCompetencies: compList,
    };
  }, [rawEmployees]);

  /* ----------------------------------------------------
     Fast ID -> Question Lookup Map
     ---------------------------------------------------- */
  const questionMap = useMemo(() => {
    const map = new Map();
    rawQuestions.forEach((q) => {
      const id = q.question_id ?? q.id ?? q._id;
      if (id != null) {
        map.set(Number(id), q);
        map.set(String(id), q);
      }
    });
    return map;
  }, [rawQuestions]);

  /* ----------------------------------------------------
     Technology-Wise Bar Chart Data Aggregation
     ---------------------------------------------------- */
  const techDistributionData = useMemo(() => {
    if (rawQuestions.length > 0) {
      const techTotals = new Map();
      const techAssigned = new Map();

      // Count total questions in bank by technology
      rawQuestions.forEach((q) => {
        const tech = q.technology_name || q.technology || q.tech_stack || q.category || 'General';
        techTotals.set(tech, (techTotals.get(tech) || 0) + 1);
      });

      // Count assigned questions by matching question IDs
      rawAssignments.forEach((assign) => {
        const qIds = [];
        if (Array.isArray(assign.question_ids)) {
          qIds.push(...assign.question_ids);
        } else if (assign.question_id != null) {
          qIds.push(assign.question_id);
        } else if (assign.questionId != null) {
          qIds.push(assign.questionId);
        }

        if (Array.isArray(assign.questions)) {
          assign.questions.forEach((q) => {
            const id = q.question_id ?? q.id;
            if (id != null) qIds.push(id);
          });
        }

        if (qIds.length > 0) {
          qIds.forEach((id) => {
            const resolvedQ = questionMap.get(id) || questionMap.get(Number(id)) || questionMap.get(String(id)) || {};
            const tech = resolvedQ.technology_name || resolvedQ.technology || resolvedQ.tech_stack || resolvedQ.category;
            if (tech) {
              techAssigned.set(tech, (techAssigned.get(tech) || 0) + 1);
            } else {
              const firstTech = Array.from(techTotals.keys())[0] || 'General';
              techAssigned.set(firstTech, (techAssigned.get(firstTech) || 0) + 1);
            }
          });
        } else {
          const resolvedQ = assign.questions || assign.question || {};
          const tech =
            resolvedQ.technology_name ||
            resolvedQ.technology ||
            resolvedQ.tech_stack ||
            resolvedQ.category ||
            assign.technology ||
            assign.technology_name;

          if (tech) {
            techAssigned.set(tech, (techAssigned.get(tech) || 0) + 1);
          } else {
            const firstTech = Array.from(techTotals.keys())[0] || 'General';
            techAssigned.set(firstTech, (techAssigned.get(firstTech) || 0) + 1);
          }
        }
      });

      return Array.from(techTotals.entries()).map(([tech, total]) => {
        const assigned = techAssigned.get(tech) || 0;
        return {
          technology: tech,
          total,
          assigned,
        };
      }).sort((a, b) => b.total - a.total);
    }

    return DEFAULT_TECH_DISTRIBUTION;
  }, [rawQuestions, rawAssignments, questionMap]);

  /* ----------------------------------------------------
     Difficulty Breakdown Aggregation
     ---------------------------------------------------- */
  const { easyCount, mediumCount, hardCount } = useMemo(() => {
    if (rawQuestions.length > 0) {
      let easy = 0;
      let med = 0;
      let hard = 0;

      rawQuestions.forEach((q) => {
        const diff = String(q.difficulty || q.difficulty_level || q.level || '').toLowerCase();
        if (diff.includes('easy')) easy += 1;
        else if (diff.includes('hard')) hard += 1;
        else med += 1;
      });

      return { easyCount: easy, mediumCount: med, hardCount: hard };
    }

    return { easyCount: 2, mediumCount: 3, hardCount: 1 };
  }, [rawQuestions]);

  // Only the Sync button in the header (no question or employee buttons, no duplicate keywords)
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
          bookmarkedCount={bookmarkCount}
          isLoading={isLoadingQuestions || isLoadingEmployees}
        />

        {/* Clean Charts Grid */}
        <div className="dash-grid-layout">
          {/* Questions by Technology Bar Chart */}
          <TechDistributionChart
            techData={techDistributionData}
            isLoading={isLoadingQuestions || isLoadingAssignments}
          />

          {/* Employee Status Doughnut Chart */}
          <EmployeeStatusChart
            activeCount={activeEmployeesCount}
            inactiveCount={inactiveEmployeesCount}
            competencies={employeeCompetencies}
            isLoading={isLoadingEmployees}
          />
        </div>

        {/* Question Difficulty Distribution */}
        <DifficultyBreakdown
          easyCount={easyCount}
          mediumCount={mediumCount}
          hardCount={hardCount}
          isLoading={isLoadingQuestions}
        />
      </div>
    </DashboardLayout>
  );
}