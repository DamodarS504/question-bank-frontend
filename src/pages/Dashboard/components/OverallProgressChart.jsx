/**
 * src/pages/Dashboard/components/OverallProgressChart.jsx
 * Independent card displaying Overall Assessment Progress as a clean Pie Chart.
 * Uses local Chart.js bundle with canvas gradients, detailed status legend, and zero network lag.
 */
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function OverallProgressChart({
  completedQuestions = 0,
  inProgressQuestions = 0,
  notStartedQuestions = 0,
  overallProgress = 0,
  totalAssignments = 0,
  isLoading = false,
}) {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const totalAssigned = totalAssignments > 0
    ? totalAssignments
    : (completedQuestions + inProgressQuestions + notStartedQuestions);

  const completedPct = totalAssigned > 0
    ? Math.round((completedQuestions / totalAssigned) * 100)
    : 0;

  const inProgressPct = totalAssigned > 0
    ? Math.round((inProgressQuestions / totalAssigned) * 100)
    : 0;

  const notStartedPct = totalAssigned > 0
    ? Math.max(0, 100 - completedPct - inProgressPct)
    : 0;

  useEffect(() => {
    if (!canvasRef.current || totalAssigned === 0 || isLoading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    // Canvas linear gradients for slices
    const completedGrad = ctx.createLinearGradient(0, 0, 160, 160);
    completedGrad.addColorStop(0, '#34d399');
    completedGrad.addColorStop(1, '#059669');

    const inProgressGrad = ctx.createLinearGradient(0, 0, 160, 160);
    inProgressGrad.addColorStop(0, '#818cf8');
    inProgressGrad.addColorStop(1, '#4f46e5');

    const notStartedGrad = ctx.createLinearGradient(0, 0, 160, 160);
    notStartedGrad.addColorStop(0, '#cbd5e1');
    notStartedGrad.addColorStop(1, '#94a3b8');

    chartInstanceRef.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Completed', 'In Progress', 'Not Started'],
        datasets: [
          {
            data: [completedQuestions, inProgressQuestions, notStartedQuestions],
            backgroundColor: [completedGrad, inProgressGrad, notStartedGrad],
            hoverBackgroundColor: ['#047857', '#4338ca', '#64748b'],
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 550,
          easing: 'easeOutQuart',
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#ffffff',
            bodyColor: '#cbd5e1',
            padding: 10,
            cornerRadius: 8,
            boxPadding: 4,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const val = context.parsed;
                const pct = totalAssigned > 0 ? Math.round((val / totalAssigned) * 100) : 0;
                return ` ${label}: ${val} (${pct}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [completedQuestions, inProgressQuestions, notStartedQuestions, totalAssigned, isLoading]);

  return (
    <div className="dash-clean-card">
      <div className="dash-card-header">
        <div>
          <h2 className="dash-card-title">Overall Progress</h2>
          <p className="dash-card-subtitle">Candidate assessment completion tracking</p>
        </div>
        <span className="dash-overall-rate-badge">{overallProgress}% Completed</span>
      </div>

      <div className="dash-doughnut-layout">
        {/* Pie Chart Container */}
        <div className="dash-doughnut-box" style={{ position: 'relative', width: '160px', height: '160px' }}>
          <div
            className="dash-canvas-holder"
            style={{
              visibility: (isLoading || totalAssigned === 0) ? 'hidden' : 'visible',
              width: '100%',
              height: '100%',
            }}
          >
            <canvas ref={canvasRef} />
          </div>

          {isLoading && (
            <div className="dash-loading-state" style={{ position: 'absolute', inset: 0, background: '#ffffff', zIndex: 2 }}>
              <span className="dash-spinner-ring" />
            </div>
          )}

          {!isLoading && totalAssigned === 0 && (
            <div className="dash-empty-state" style={{ position: 'absolute', inset: 0, background: '#ffffff', zIndex: 2 }}>
              <span>📋</span>
              <p>No tasks assigned</p>
            </div>
          )}
        </div>

        {/* Status Breakdown List */}
        <div className="dash-status-list">
          {/* Completed */}
          <div className="dash-status-item">
            <div className="dash-status-item__left">
              <span className="dash-status-dot dash-status-dot--completed" />
              <strong>Completed</strong>
            </div>
            <div className="dash-status-item__right">
              <span className="dash-status-number">{completedQuestions}</span>
              <span className="dash-status-pct dash-status-pct--emerald">{completedPct}%</span>
            </div>
          </div>

          {/* In Progress */}
          <div className="dash-status-item">
            <div className="dash-status-item__left">
              <span className="dash-status-dot dash-status-dot--inprogress" />
              <strong>In Progress</strong>
            </div>
            <div className="dash-status-item__right">
              <span className="dash-status-number">{inProgressQuestions}</span>
              <span className="dash-status-pct dash-status-pct--indigo">{inProgressPct}%</span>
            </div>
          </div>

          {/* Not Started */}
          <div className="dash-status-item">
            <div className="dash-status-item__left">
              <span className="dash-status-dot dash-status-dot--notstarted" />
              <strong>Not Started</strong>
            </div>
            <div className="dash-status-item__right">
              <span className="dash-status-number">{notStartedQuestions}</span>
              <span className="dash-status-pct dash-status-pct--slate">{notStartedPct}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dash-progress-footer-strip">
        <span className="dash-progress-footer-tasks">
          Total Assigned Tasks: <strong>{totalAssigned}</strong>
        </span>
        <span className="dash-progress-footer-rate">
          Avg Completion: <strong>{overallProgress}%</strong>
        </span>
      </div>
    </div>
  );
}
