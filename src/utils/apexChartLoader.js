/**
 * src/utils/apexChartLoader.js
 * High-performance loader for ApexCharts.
 * Resolves window.ApexCharts if already present or loads the official UMD bundle once.
 */

let apexLoadPromise = null;

export function loadApexCharts() {
  if (typeof window !== 'undefined' && window.ApexCharts) {
    return Promise.resolve(window.ApexCharts);
  }

  if (apexLoadPromise) {
    return apexLoadPromise;
  }

  apexLoadPromise = new Promise((resolve, reject) => {
    // Check if script tag is already in DOM
    const existing = document.querySelector('script[src*="apexcharts"]');
    if (existing && window.ApexCharts) {
      resolve(window.ApexCharts);
      return;
    }

    const script = existing || document.createElement('script');
    if (!existing) {
      script.src = 'https://cdn.jsdelivr.net/npm/apexcharts@3.54.1/dist/apexcharts.min.js';
      script.async = true;
      document.head.appendChild(script);
    }

    const checkInterval = setInterval(() => {
      if (window.ApexCharts) {
        clearInterval(checkInterval);
        resolve(window.ApexCharts);
      }
    }, 40);

    script.onerror = (err) => {
      clearInterval(checkInterval);
      apexLoadPromise = null;
      reject(err);
    };

    // Timeout safety fallback (7 seconds)
    setTimeout(() => {
      clearInterval(checkInterval);
      if (window.ApexCharts) {
        resolve(window.ApexCharts);
      } else {
        apexLoadPromise = null;
        reject(new Error('ApexCharts timed out while loading'));
      }
    }, 7000);
  });

  return apexLoadPromise;
}
