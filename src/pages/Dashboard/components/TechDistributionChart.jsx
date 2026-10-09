/**
 * src/pages/Dashboard/components/TechDistributionChart.jsx
 * High-aesthetic Bar Chart for Technology-Wise Questions & Assignments.
 * Uses local Chart.js bundle with custom canvas gradients, rounded ends, and zero network lag.
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';

export default function TechDistributionChart({
  techData = [],
  isLoading = false,
}) {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [activeView, setActiveView] = useState('grouped'); // 'grouped' | 'total' | 'assigned'

  // Normalize data (sort and pick top 8 technologies)
  const chartData = useMemo(() => {
    if (!techData || techData.length === 0) return [];
    return [...techData]
      .map((d) => ({
        technology: d.technology,
        total: d.total_questions ?? d.total ?? 0,
        assigned: d.assigned_questions ?? d.assigned ?? 0,
      }))
      .sort((a, b) => (b.total || 0) - (a.total || 0))
      .slice(0, 8);
  }, [techData]);

  const totalInBank = useMemo(
    () => chartData.reduce((acc, d) => acc + (d.total || 0), 0),
    [chartData]
  );
  const totalAssigned = useMemo(
    () => chartData.reduce((acc, d) => acc + (d.assigned || 0), 0),
    [chartData]
  );

  useEffect(() => {
    if (!canvasRef.current || chartData.length === 0 || isLoading) return;

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

    const tealGradient = ctx.createLinearGradient(0, 0, 0, 240);
    tealGradient.addColorStop(0, '#14b8a6');
    tealGradient.addColorStop(1, '#0d9488');

    const indigoGradient = ctx.createLinearGradient(0, 0, 0, 240);
    indigoGradient.addColorStop(0, '#818cf8');
    indigoGradient.addColorStop(1, '#4f46e5');

    const labels = chartData.map((d) => d.technology);
    const totals = chartData.map((d) => d.total || 0);
    const assigned = chartData.map((d) => d.assigned || 0);

    let datasets = [];

    if (activeView === 'grouped') {
      datasets = [
        {
          label: 'Total Questions',
          data: totals,
          backgroundColor: tealGradient,
          hoverBackgroundColor: '#0f766e',
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 32,
          categoryPercentage: 0.65,
          barPercentage: 0.9,
        },
        {
          label: 'Assigned',
          data: assigned,
          backgroundColor: indigoGradient,
          hoverBackgroundColor: '#4338ca',
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 32,
          categoryPercentage: 0.65,
          barPercentage: 0.9,
        },
      ];
    } else if (activeView === 'total') {
      datasets = [
        {
          label: 'Total Questions',
          data: totals,
          backgroundColor: tealGradient,
          hoverBackgroundColor: '#0f766e',
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 46,
        },
      ];
    } else {
      datasets = [
        {
          label: 'Assigned Questions',
          data: assigned,
          backgroundColor: indigoGradient,
          hoverBackgroundColor: '#4338ca',
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 46,
        },
      ];
    }

    const maxVal = Math.max(
      ...chartData.map((d) => Math.max(d.total || 0, d.assigned || 0)),
      4
    );

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 550,
          easing: 'easeOutQuart',
        },
        layout: {
          padding: {
            top: 10,
            bottom: 4,
            left: 4,
            right: 8,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#475569',
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                weight: '600',
                size: 12,
              },
              padding: 6,
            },
            border: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            suggestedMax: Math.ceil(maxVal * 1.15),
            grid: {
              color: '#f1f5f9',
              drawBorder: false,
            },
            ticks: {
              stepSize: 1,
              precision: 0,
              color: '#94a3b8',
              font: {
                family: "'Inter', sans-serif",
                size: 11,
              },
              padding: 8,
            },
            border: {
              display: false,
            },
          },
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
            titleFont: {
              family: "'Plus Jakarta Sans', sans-serif",
              size: 12,
              weight: '700',
            },
            bodyFont: {
              family: "'Inter', sans-serif",
              size: 11,
            },
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const val = context.parsed.y;
                return ` ${label}: ${val} questions`;
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
  }, [activeView, chartData, isLoading]);

  return (
    <div className="dash-clean-card">
      <div className="dash-card-header">
        <div>
          <h2 className="dash-card-title">Questions by Technology</h2>
          <p className="dash-card-subtitle">Distribution across technical stacks</p>
        </div>

        <div className="dash-btn-group" role="tablist">
          <button
            type="button"
            className={`dash-pill-btn ${activeView === 'grouped' ? 'is-active' : ''}`}
            onClick={() => setActiveView('grouped')}
          >
            Comparison
          </button>
          <button
            type="button"
            className={`dash-pill-btn ${activeView === 'total' ? 'is-active' : ''}`}
            onClick={() => setActiveView('total')}
          >
            Total ({totalInBank})
          </button>
          <button
            type="button"
            className={`dash-pill-btn ${activeView === 'assigned' ? 'is-active' : ''}`}
            onClick={() => setActiveView('assigned')}
          >
            Assigned ({totalAssigned})
          </button>
        </div>
      </div>

      <div className="dash-chart-legend-strip">
        {(activeView === 'grouped' || activeView === 'total') && (
          <div className="dash-legend-badge">
            <span className="dash-legend-box dash-legend-box--teal" />
            <span>Total Questions</span>
          </div>
        )}
        {(activeView === 'grouped' || activeView === 'assigned') && (
          <div className="dash-legend-badge">
            <span className="dash-legend-box dash-legend-box--indigo" />
            <span>Assigned</span>
          </div>
        )}
      </div>

      <div className="dash-chartjs-wrapper dash-tech-chart-wrapper" style={{ position: 'relative', height: '175px' }}>
        <canvas
          ref={canvasRef}
          style={{
            visibility: (isLoading || chartData.length === 0) ? 'hidden' : 'visible',
            width: '100%',
            height: '100%',
          }}
        />

        {isLoading && (
          <div className="dash-loading-state" style={{ position: 'absolute', inset: 0, background: '#ffffff', zIndex: 2 }}>
            <span className="dash-spinner-ring" />
            <p>Loading chart...</p>
          </div>
        )}

        {!isLoading && chartData.length === 0 && (
          <div className="dash-empty-state" style={{ position: 'absolute', inset: 0, background: '#ffffff', zIndex: 2 }}>
            <span>📊</span>
            <p>No questions recorded</p>
          </div>
        )}
      </div>

      <div className="dash-progress-footer-strip">
        <span className="dash-progress-footer-tasks">
          Active Stacks: <strong>{chartData.length}</strong>
        </span>
        <span className="dash-progress-footer-rate">
          Total Assigned: <strong>{totalAssigned}</strong>
        </span>
      </div>
    </div>
  );
}
