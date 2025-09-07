import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  imageLoadTime: number;
  totalImages: number;
  loadedImages: number;
}

/**
 * Performance monitoring component for tracking image loading and Core Web Vitals
 */
export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run in development or when explicitly enabled
    if (process.env.NODE_ENV !== 'development' && !window.location.search.includes('debug=performance')) {
      return;
    }

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      
      // Core Web Vitals
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      const lcp = performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0;
      
      // Image loading metrics
      const imageEntries = performance.getEntriesByType('resource').filter(
        entry => entry.name.includes('.jpg') || entry.name.includes('.jpeg') || entry.name.includes('.png') || entry.name.includes('.webp')
      );
      
      const totalImages = imageEntries.length;
      const loadedImages = imageEntries.filter(entry => entry.transferSize > 0).length;
      const avgImageLoadTime = imageEntries.reduce((sum, entry) => sum + entry.duration, 0) / totalImages || 0;

      const performanceMetrics: PerformanceMetrics = {
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        firstContentfulPaint: fcp,
        largestContentfulPaint: lcp,
        firstInputDelay: 0, // Would need to measure with PerformanceObserver
        cumulativeLayoutShift: 0, // Would need to measure with PerformanceObserver
        imageLoadTime: avgImageLoadTime,
        totalImages,
        loadedImages,
      };

      setMetrics(performanceMetrics);
    };

    // Measure performance after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    // Set up keyboard shortcut to toggle visibility
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('load', measurePerformance);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  if (!metrics || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Performance Metrics</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white text-xs"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Page Load:</span>
          <span className={metrics.loadTime < 2000 ? 'text-green-400' : 'text-yellow-400'}>
            {metrics.loadTime.toFixed(0)}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>First Paint:</span>
          <span className={metrics.firstContentfulPaint < 1500 ? 'text-green-400' : 'text-yellow-400'}>
            {metrics.firstContentfulPaint.toFixed(0)}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Largest Paint:</span>
          <span className={metrics.largestContentfulPaint < 2500 ? 'text-green-400' : 'text-yellow-400'}>
            {metrics.largestContentfulPaint.toFixed(0)}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Images:</span>
          <span className={metrics.loadedImages === metrics.totalImages ? 'text-green-400' : 'text-yellow-400'}>
            {metrics.loadedImages}/{metrics.totalImages}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Avg Image Load:</span>
          <span className={metrics.imageLoadTime < 500 ? 'text-green-400' : 'text-yellow-400'}>
            {metrics.imageLoadTime.toFixed(0)}ms
          </span>
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-600">
        <p className="text-xs text-gray-400">
          Press Ctrl+Shift+P to toggle
        </p>
      </div>
    </div>
  );
}

export default PerformanceMonitor;
