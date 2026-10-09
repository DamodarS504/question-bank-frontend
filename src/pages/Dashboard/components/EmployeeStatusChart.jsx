/**
 * src/pages/Dashboard/components/EmployeeStatusChart.jsx
 * High-aesthetic Doughnut Chart for Active vs Inactive Employees.
 * Uses local Chart.js bundle with canvas gradients, center stats, and zero network dependency.
 */
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Chart from 'chart.js/auto';

export default function EmployeeStatusChart({
  activeCount = 0,
  inactiveCount = 0,
  competencies = [],
  isLoading = false,
}) {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const total = activeCount + inactiveCount;
  const activePercent = total > 0 ? Math.round((activeCount / total) * 100) : 0;
  const inactivePercent = total > 0 ? Math.max(0, 100 - activePercent) : 0;

  useEffect(() => {
    if (!canvasRef.current || total === 0 || isLoading) return;

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

    // Create gradient arcs
    const activeGrad = ctx.createLinearGradient(0, 0, 160, 160);
    activeGrad.addColorStop(0, '#34d399');
    activeGrad.addColorStop(1, '#059669');

    const inactiveGrad = ctx.createLinearGradient(0, 0, 160, 160);
    inactiveGrad.addColorStop(0, '#fbbf24');
    inactiveGrad.addColorStop(1, '#d97706');

    chartInstanceRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Active', 'Inactive'],
        datasets: [
          {
            data: [activeCount, inactiveCount],
            backgroundColor: [activeGrad, inactiveGrad],
            hoverBackgroundColor: ['#047857', '#b45309'],
            borderWidth: 0,
            borderRadius: 5,
            spacing: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
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
                const pct = total > 0 ? Math.round((val / total) * 100) : 0;
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
  }, [activeCount, inactiveCount, total, isLoading]);

  return (
    <div className="dash-clean-card">
      <div className="dash-card-header">
        <div>
          <h2 className="dash-card-title">Employee Status</h2>
          <p className="dash-card-subtitle">Active vs inactive team presence</p>
        </div>
        <Link to="/employees" className="dash-link-btn">
          View All &rarr;
        </Link>
      </div>

      <div className="dash-doughnut-layout">
        <div className="dash-doughnut-box" style={{ position: 'relative' }}>
          <div
            className="dash-canvas-holder"
            style={{
              visibility: (isLoading || total === 0) ? 'hidden' : 'visible',
              width: '100%',
              height: '100%',
            }}
          >
            <canvas ref={canvasRef} />
            <div className="dash-doughnut-center-info">
              <span className="dash-center-number">{total}</span>
              <span className="dash-center-label">Total</span>
              <span className="dash-center-badge">{activePercent}% Active</span>
            </div>
          </div>

          {isLoading && (
            <div className="dash-loading-state" style={{ position: 'absolute', inset: 0, background: '#ffffff', zIndex: 2 }}>
              <span className="dash-spinner-ring" />
            </div>
          )}

          {!isLoading && total === 0 && (
            <div className="dash-empty-state" style={{ position: 'absolute', inset: 0, background: '#ffffff', zIndex: 2 }}>
              <span>👥</span>
              <p>No employees</p>
            </div>
          )}
        </div>

        <div className="dash-status-list">
          <div className="dash-status-item">
            <div className="dash-status-item__left">
              <span className="dash-status-dot dash-status-dot--active" />
              <strong>Active</strong>
            </div>
            <div className="dash-status-item__right">
              <span className="dash-status-number">{activeCount}</span>
              <span className="dash-status-pct dash-status-pct--emerald">{activePercent}%</span>
            </div>
          </div>

          <div className="dash-status-item">
            <div className="dash-status-item__left">
              <span className="dash-status-dot dash-status-dot--inactive" />
              <strong>Inactive</strong>
            </div>
            <div className="dash-status-item__right">
              <span className="dash-status-number">{inactiveCount}</span>
              <span className="dash-status-pct dash-status-pct--amber">{inactivePercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {competencies.length > 0 && (
        <div className="dash-competency-footer">
          <div className="dash-competency-pills">
            {competencies.slice(0, 5).map((comp) => (
              <span className="dash-comp-tag" key={comp.name || comp}>
                {comp.name || comp}
                {comp.count ? <strong className="dash-comp-tag-count">{comp.count}</strong> : null}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
