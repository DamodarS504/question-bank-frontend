/**
 * src/pages/Dashboard/components/TechDistributionChart.jsx
 * Clean, minimal Chart.js Bar Chart for Technology-Wise Questions & Assignments.
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { loadChartJs } from '../../../utils/chartLoader';

export default function TechDistributionChart({
  techData = [],
  isLoading = false,
}) {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [activeView, setActiveView] = useState('grouped'); // 'grouped' | 'total' | 'assigned'
  const [chartReady, setChartReady] = useState(false);

  // Normalize data (sort and pick top 8 technologies)
  const chartData = useMemo(() => {
    if (!techData || techData.length === 0) return [];
    return [...techData]
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
    let mounted = true;
    loadChartJs()
      .then(() => {
        if (mounted) setChartReady(true);
      })
      .catch((err) => {
        console.error('Failed to load Chart.js:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!chartReady || !canvasRef.current || chartData.length === 0 || isLoading) return;

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

    const labels = chartData.map((d) => d.technology);
    const totals = chartData.map((d) => d.total || 0);
    const assigned = chartData.map((d) => d.assigned || 0);

    let datasets = [];

    if (activeView === 'grouped') {
      datasets = [
        {
          label: 'Total Questions',
          data: totals,
          backgroundColor: '#0d9488',
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
          backgroundColor: '#6366f1',
          hoverBackgroundColor: '#4f46e5',
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
          backgroundColor: '#0d9488',
          hoverBackgroundColor: '#0f766e',
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 44,
        },
      ];
    } else {
      datasets = [
        {
          label: 'Assigned Questions',
          data: assigned,
          backgroundColor: '#6366f1',
          hoverBackgroundColor: '#4f46e5',
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 44,
        },
      ];
    }

    const maxVal = Math.max(
      ...chartData.map((d) => Math.max(d.total || 0, d.assigned || 0)),
      4
    );

    chartInstanceRef.current = new ChartClass(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 500,
          easing: 'easeOutQuart',
        },
        layout: {
          padding: {
            top: 10,
            bottom: 5,
            left: 5,
            right: 10,
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
                return ` ${label}: ${val}`;
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
  }, [chartReady, activeView, chartData, isLoading]);

  return (
    <div className="dash-clean-card">
      <div className="dash-card-header">
        <h2 className="dash-card-title">Questions by Technology</h2>

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

      <div className="dash-chartjs-wrapper" style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{
            visibility: (isLoading || !chartReady || chartData.length === 0) ? 'hidden' : 'visible',
            width: '100%',
            height: '100%',
          }}
        />

        {(isLoading || !chartReady) && (
          <div className="dash-loading-state" style={{ position: 'absolute', inset: 0, background: '#ffffff', zIndex: 2 }}>
            <span className="dash-spinner-ring" />
            <p>Loading chart...</p>
          </div>
        )}

        {!isLoading && chartReady && chartData.length === 0 && (
          <div className="dash-empty-state" style={{ position: 'absolute', inset: 0, background: '#ffffff', zIndex: 2 }}>
            <span>📊</span>
            <p>No questions recorded</p>
          </div>
        )}
      </div>
    </div>
  );
}
