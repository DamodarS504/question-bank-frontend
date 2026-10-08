/**
 * src/utils/chartLoader.js
 * Reliable loader for Chart.js in Vite / React.
 * Uses window.Chart if present, or dynamically injects the UMD script once.
 */

let loadPromise = null;

export function loadChartJs() {
  if (typeof window !== 'undefined' && window.Chart) {
    return Promise.resolve(window.Chart);
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    // Check if script tag already exists
    const existing = document.querySelector('script[src*="chart.umd.min.js"]');
    if (existing && window.Chart) {
      resolve(window.Chart);
      return;
    }

    const script = existing || document.createElement('script');
    if (!existing) {
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js';
      script.async = true;
      document.head.appendChild(script);
    }

    const checkInterval = setInterval(() => {
      if (window.Chart) {
        clearInterval(checkInterval);
        resolve(window.Chart);
      }
    }, 50);

    script.onerror = (err) => {
      clearInterval(checkInterval);
      loadPromise = null;
      reject(err);
    };

    // Timeout after 6 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if (window.Chart) {
        resolve(window.Chart);
      } else {
        loadPromise = null;
        reject(new Error('Chart.js timed out while loading'));
      }
    }, 6000);
  });

  return loadPromise;
}
