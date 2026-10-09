/**
 * src/pages/Dashboard/components/DifficultyBreakdown.jsx
 * Independent card displaying Difficulty Distribution as a Doughnut Chart.
 * Uses local Chart.js bundle with canvas gradients, center stats, and clean difficulty tier list.
 */
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function DifficultyBreakdown({
  easyCount = 0,
  mediumCount = 0,
  hardCount = 0,
  isLoading = false,
}) {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const total = easyCount + mediumCount + hardCount;
  const easyPct = total > 0 ? Math.round((easyCount / total) * 100) : 0;
  const medPct = total > 0 ? Math.round((mediumCount / total) * 100) : 0;
  const hardPct = total > 0 ? Math.max(0, 100 - easyPct - medPct) : 0;

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

    // Gradient arcs for Easy, Medium, Hard
    const easyGrad = ctx.createLinearGradient(0, 0, 160, 160);
    easyGrad.addColorStop(0, '#34d399');
    easyGrad.addColorStop(1, '#059669');

    const medGrad = ctx.createLinearGradient(0, 0, 160, 160);
    medGrad.addColorStop(0, '#fbbf24');
    medGrad.addColorStop(1, '#d97706');

    const hardGrad = ctx.createLinearGradient(0, 0, 160, 160);
    hardGrad.addColorStop(0, '#fb7185');
    hardGrad.addColorStop(1, '#e11d48');

    chartInstanceRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Easy', 'Medium', 'Hard'],
        datasets: [
          {
            data: [easyCount, mediumCount, hardCount],
            backgroundColor: [easyGrad, medGrad, hardGrad],
            hoverBackgroundColor: ['#047857', '#b45309', '#be123c'],
            borderWidth: 0,
            borderRadius: 6,
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
                return ` ${label}: ${val} questions (${pct}%)`;
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
  }, [easyCount, mediumCount, hardCount, total, isLoading]);

  return (
    <div className="dash-clean-card">
      <div className="dash-card-header">
        <div>
          <h2 className="dash-card-title">Difficulty Distribution</h2>
          <p className="dash-card-subtitle">Complexity breakdown across question bank</p>
        </div>
        <span className="dash-count-badge">{total} Total Questions</span>
      </div>

      <div className="dash-doughnut-layout">
        <div className="dash-doughnut-box" style={{ position: 'relative', width: '160px', height: '160px' }}>
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
              <span className="dash-center-badge">3 Tiers</span>
            </div>
          </div>

          {isLoading && (
            <div className="dash-loading-state" style={{ position: 'absolute', inset: 0, background: '#ffffff', zIndex: 2 }}>
              <span className="dash-spinner-ring" />
            </div>
          )}

          {!isLoading && total === 0 && (
            <div className="dash-empty-state" style={{ position: 'absolute', inset: 0, background: '#ffffff', zIndex: 2 }}>
              <span>❓</span>
              <p>No questions</p>
            </div>
          )}
        </div>

        {/* Breakdown List */}
        <div className="dash-status-list">
          {/* Easy */}
          <div className="dash-status-item">
            <div className="dash-status-item__left">
              <span className="dash-status-dot dash-diff-dot--easy" />
              <strong>Easy</strong>
            </div>
            <div className="dash-status-item__right">
              <span className="dash-status-number">{easyCount}</span>
              <span className="dash-status-pct dash-status-pct--emerald">{easyPct}%</span>
            </div>
          </div>

          {/* Medium */}
          <div className="dash-status-item">
            <div className="dash-status-item__left">
              <span className="dash-status-dot dash-diff-dot--med" />
              <strong>Medium</strong>
            </div>
            <div className="dash-status-item__right">
              <span className="dash-status-number">{mediumCount}</span>
              <span className="dash-status-pct dash-status-pct--amber">{medPct}%</span>
            </div>
          </div>

          {/* Hard */}
          <div className="dash-status-item">
            <div className="dash-status-item__left">
              <span className="dash-status-dot dash-diff-dot--hard" />
              <strong>Hard</strong>
            </div>
            <div className="dash-status-item__right">
              <span className="dash-status-number">{hardCount}</span>
              <span className="dash-status-pct dash-status-pct--rose">{hardPct}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dash-progress-footer-strip">
        <span className="dash-progress-footer-tasks">
          Highest Tier: <strong>{easyCount >= mediumCount && easyCount >= hardCount ? 'Easy' : (mediumCount >= hardCount ? 'Medium' : 'Hard')}</strong>
        </span>
        <span className="dash-progress-footer-rate">
          Tier Spread: <strong>{total > 0 ? 'Active' : 'Empty'}</strong>
        </span>
      </div>
    </div>
  );
}
