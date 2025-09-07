import { useState, useEffect, useCallback } from 'react';

interface PreloadOptions {
  priority?: boolean;
  timeout?: number;
  retries?: number;
}

interface PreloadResult {
  isLoaded: boolean;
  hasError: boolean;
  progress: number;
}

/**
 * Hook for preloading images with progress tracking and error handling
 */
export function useImagePreloader(
  imageUrls: string[],
  options: PreloadOptions = {}
) {
  const { priority = false, timeout = 10000, retries = 2 } = options;
  
  const [results, setResults] = useState<Map<string, PreloadResult>>(new Map());
  const [overallProgress, setOverallProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const preloadImage = useCallback((url: string): Promise<PreloadResult> => {
    return new Promise((resolve) => {
      const img = new Image();
      let retryCount = 0;
      
      const attemptLoad = () => {
        const timeoutId = setTimeout(() => {
          if (retryCount < retries) {
            retryCount++;
            attemptLoad();
          } else {
            resolve({ isLoaded: false, hasError: true, progress: 100 });
          }
        }, timeout);

        img.onload = () => {
          clearTimeout(timeoutId);
          resolve({ isLoaded: true, hasError: false, progress: 100 });
        };

        img.onerror = () => {
          clearTimeout(timeoutId);
          if (retryCount < retries) {
            retryCount++;
            attemptLoad();
          } else {
            resolve({ isLoaded: false, hasError: true, progress: 100 });
          }
        };

        img.src = url;
      };

      attemptLoad();
    });
  }, [timeout, retries]);

  useEffect(() => {
    if (imageUrls.length === 0) {
      setIsComplete(true);
      return;
    }

    let isCancelled = false;
    const resultsMap = new Map<string, PreloadResult>();

    const preloadAll = async () => {
      const promises = imageUrls.map(async (url, index) => {
        if (isCancelled) return;

        // Initialize with loading state
        resultsMap.set(url, { isLoaded: false, hasError: false, progress: 0 });
        setResults(new Map(resultsMap));

        const result = await preloadImage(url);
        
        if (!isCancelled) {
          resultsMap.set(url, result);
          setResults(new Map(resultsMap));

          // Calculate overall progress
          const loadedCount = Array.from(resultsMap.values()).filter(r => r.isLoaded || r.hasError).length;
          const progress = (loadedCount / imageUrls.length) * 100;
          setOverallProgress(progress);

          if (loadedCount === imageUrls.length) {
            setIsComplete(true);
          }
        }
      });

      await Promise.allSettled(promises);
    };

    preloadAll();

    return () => {
      isCancelled = true;
    };
  }, [imageUrls, preloadImage]);

  const getImageStatus = useCallback((url: string): PreloadResult | undefined => {
    return results.get(url);
  }, [results]);

  const isImageLoaded = useCallback((url: string): boolean => {
    return results.get(url)?.isLoaded ?? false;
  }, [results]);

  const hasImageError = useCallback((url: string): boolean => {
    return results.get(url)?.hasError ?? false;
  }, [results]);

  return {
    results,
    overallProgress,
    isComplete,
    getImageStatus,
    isImageLoaded,
    hasImageError,
    loadedCount: Array.from(results.values()).filter(r => r.isLoaded).length,
    errorCount: Array.from(results.values()).filter(r => r.hasError).length,
  };
}

export default useImagePreloader;
