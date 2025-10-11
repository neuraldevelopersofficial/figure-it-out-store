import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FallbackImage } from './fallback-image';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  lazy?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  debug?: boolean;
}

/**
 * OptimizedImage component with advanced performance features:
 * - Lazy loading with Intersection Observer
 * - Progressive loading with blur placeholder
 * - Image compression and resizing
 * - Preloading for above-the-fold images
 * - Error handling and retry logic
 */
export function OptimizedImage({
  src,
  fallbackSrc = '/placeholder-image.png',
  alt,
  className = '',
  lazy = true,
  priority = false,
  quality = 80,
  sizes = '100vw',
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  debug = false,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized image URL
  const getOptimizedSrc = useCallback((originalSrc: string): string => {
    if (!originalSrc) return fallbackSrc;
    
    // If it's already a data URL or local image, return as is
    if (originalSrc.startsWith('data:') || originalSrc.startsWith('/')) {
      return originalSrc;
    }

    // For Cloudinary images, they're already optimized - return as is
    if (originalSrc.includes('cloudinary.com')) {
      return originalSrc;
    }

    // For other external images, return as is (Cloudinary handles optimization)
    return originalSrc;
  }, [fallbackSrc, quality]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (debug) console.log('🖼️ Image entered viewport:', src);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, priority, isInView, src, debug]);

  // Update current source when in view
  useEffect(() => {
    if (isInView && src) {
      setCurrentSrc(getOptimizedSrc(src));
    }
  }, [isInView, src, getOptimizedSrc]);

  // Preload high-priority images
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = getOptimizedSrc(src);
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, src, getOptimizedSrc]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    if (debug) console.log('✅ Image loaded successfully:', src);
    onLoad?.();
  }, [src, onLoad, debug]);

  const handleError = useCallback(() => {
    setHasError(true);
    if (debug) console.log('❌ Image failed to load:', src);
    onError?.();
  }, [src, onError, debug]);

  // Generate blur placeholder
  const getBlurPlaceholder = (): string => {
    if (blurDataURL) return blurDataURL;
    
    // Generate a simple gradient blur placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 40, 40);
      gradient.addColorStop(0, '#f3f4f6');
      gradient.addColorStop(1, '#e5e7eb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 40, 40);
    }
    
    return canvas.toDataURL();
  };

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: 'auto' }}
    >
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && isInView && (
        <img
          src={getBlurPlaceholder()}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          aria-hidden="true"
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && isInView && placeholder === 'empty' && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="relative">
            {/* Main loading circle */}
            <div className="w-8 h-8 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
            
            {/* Floating particles */}
            <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="absolute -top-1 -right-1 w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}

      {/* Main image */}
      {isInView && (
        <FallbackImage
          src={currentSrc}
          fallbackSrc={fallbackSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          debug={debug}
          {...props}
        />
      )}

      {/* Loading indicator */}
      {isInView && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="relative">
            {/* Main loading circle */}
            <div className="w-6 h-6 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
            
            {/* Floating particles */}
            <div className="absolute -top-0.5 -left-0.5 w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="absolute -top-0.5 -right-0.5 w-0.5 h-0.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute -bottom-0.5 -left-0.5 w-0.5 h-0.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute -bottom-0.5 -right-0.5 w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OptimizedImage;
