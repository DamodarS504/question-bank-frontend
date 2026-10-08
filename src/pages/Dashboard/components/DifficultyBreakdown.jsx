/**
 * src/pages/Dashboard/components/DifficultyBreakdown.jsx
 * Executive, interactive Chart.js Doughnut diagram and tier cards for Easy, Medium, and Hard questions.
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadChartJs } from '../../../utils/chartLoader';

export default function DifficultyBreakdown({
  easyCount = 0,
  mediumCount = 0,
  hardCount = 0,
  isLoading = false,
}) {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [chartReady, setChartReady] = useState(false);

  const total = easyCount + mediumCount + hardCount;
  const easyPct = total > 0 ? Math.round((easyCount / total) * 100) : 0;
  const medPct = total > 0 ? Math.round((mediumCount / total) * 100) : 0;
  const hardPct = total > 0 ? Math.max(0, 100 - easyPct - medPct) : 0;

  useEffect(() => {
    let mounted = true;
    loadChartJs()
      .then(() => {
        if (mounted) setChartReady(true);
      })
      .catch((err) => {
        console.error('Failed to load Chart.js for difficulty chart:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!chartReady || !canvasRef.current || total === 0 || isLoading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ChartClass = window.Chart;
    if (!ChartClass) return;

    const existingChart = ChartClass.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }
    chartInstanceRef.current = new ChartClass(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Easy', 'Medium', 'Hard'],
        datasets: [
          {
            data: [easyCount, mediumCount, hardCount],
            backgroundColor: ['#10b981', '#f59e0b', '#f43f5e'],
            hoverBackgroundColor: ['#059669', '#d97706', '#e11d48'],
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
          duration: 500,
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
  }, [chartReady, easyCount, mediumCount, hardCount, total, isLoading]);

  return (
    <div className="dash-clean-card dash-diff-card" style={{ position: 'relative' }}>
      <div className="dash-card-header">
        <div>
          <h3 className="dash-card-title">Difficulty Distribution</h3>
          <p className="dash-card-subtitle">Breakdown of interview questions across technical complexity tiers</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="dash-count-badge">{total} Total Questions</span>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div
          style={{
            visibility: (isLoading || total === 0) ? 'hidden' : 'visible',
          }}
        >
          <div className="dash-diff-body">
            {/* Left Column: Interactive Chart.js Donut Ring with Center Metric */}
            <div className="dash-diff-chart-col">
              <div className="dash-diff-doughnut-box">
                <div className="dash-canvas-holder">
                  <canvas ref={canvasRef} />
                </div>
                <div className="dash-diff-center-info">
                  <span className="dash-diff-center-num">{total}</span>
                  <span className="dash-diff-center-text">Total</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3 Rich Tier Cards Grid */}
            <div className="dash-diff-cards-grid">
              {/* Easy Card */}
              <div className="dash-diff-tier-card dash-diff-tier-card--easy">
                <div className="dash-diff-tier-head">
                  <div className="dash-diff-tier-title-wrap">
                    <span className="dash-diff-tier-dot dash-diff-tier-dot--easy" />
                    <span className="dash-diff-tier-name">Easy</span>
                  </div>
                  <span className="dash-diff-tier-badge dash-diff-tier-badge--easy">{easyPct}%</span>
                </div>
                <div className="dash-diff-tier-main">
                  <span className="dash-diff-tier-number">{easyCount}</span>
                  <span className="dash-diff-tier-ratio">{easyCount} of {total} questions</span>
                </div>
                <div className="dash-diff-bar-track">
                  <div className="dash-diff-bar-fill dash-diff-bar-fill--easy" style={{ width: `${easyPct}%` }} />
                </div>
                <div className="dash-diff-tier-footer">
                  <span className="dash-diff-tier-desc">Foundational</span>
                </div>
              </div>

              {/* Medium Card */}
              <div className="dash-diff-tier-card dash-diff-tier-card--med">
                <div className="dash-diff-tier-head">
                  <div className="dash-diff-tier-title-wrap">
                    <span className="dash-diff-tier-dot dash-diff-tier-dot--med" />
                    <span className="dash-diff-tier-name">Medium</span>
                  </div>
                  <span className="dash-diff-tier-badge dash-diff-tier-badge--med">{medPct}%</span>
                </div>
                <div className="dash-diff-tier-main">
                  <span className="dash-diff-tier-number">{mediumCount}</span>
                  <span className="dash-diff-tier-ratio">{mediumCount} of {total} questions</span>
                </div>
                <div className="dash-diff-bar-track">
                  <div className="dash-diff-bar-fill dash-diff-bar-fill--med" style={{ width: `${medPct}%` }} />
                </div>
                <div className="dash-diff-tier-footer">
                  <span className="dash-diff-tier-desc">Intermediate</span>
                </div>
              </div>

              {/* Hard Card */}
              <div className="dash-diff-tier-card dash-diff-tier-card--hard">
                <div className="dash-diff-tier-head">
                  <div className="dash-diff-tier-title-wrap">
                    <span className="dash-diff-tier-dot dash-diff-tier-dot--hard" />
                    <span className="dash-diff-tier-name">Hard</span>
                  </div>
                  <span className="dash-diff-tier-badge dash-diff-tier-badge--hard">{hardPct}%</span>
                </div>
                <div className="dash-diff-tier-main">
                  <span className="dash-diff-tier-number">{hardCount}</span>
                  <span className="dash-diff-tier-ratio">{hardCount} of {total} questions</span>
                </div>
                <div className="dash-diff-bar-track">
                  <div className="dash-diff-bar-fill dash-diff-bar-fill--hard" style={{ width: `${hardPct}%` }} />
                </div>
                <div className="dash-diff-tier-footer">
                  <span className="dash-diff-tier-desc">Advanced</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {isLoading && (
          <div className="dash-loading-state" style={{ position: 'absolute', inset: 0, background: '#ffffff', zIndex: 2, minHeight: '180px' }}>
            <div className="dash-spinner-ring" />
            <span>Analyzing difficulty tiers...</span>
          </div>
        )}

        {!isLoading && total === 0 && (
          <div className="dash-empty-state" style={{ position: 'absolute', inset: 0, background: '#ffffff', zIndex: 2, minHeight: '180px' }}>
            <p>No questions currently recorded.</p>
            <Link to="/questions" className="dash-secondary-btn" style={{ marginTop: '8px' }}>
              Upload Questions
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
