import React, { useState, useEffect } from 'react';
import { getGoogleDriveProxyUrl } from '@/lib/utils';

interface FallbackImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  debug?: boolean;
  retryCount?: number;
}

/**
 * A component that renders an image with a fallback if the primary image fails to load
 * Optimized for Cloudinary images with automatic fallback mechanisms
 */
export function FallbackImage({
  src,
  fallbackSrc = '/placeholder-image.png', // Default fallback image
  alt,
  className = '',
  onLoad,
  onError,
  debug = false,
  retryCount = 1,
  ...props
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [hasError, setHasError] = useState<boolean>(false);
  const [retries, setRetries] = useState<number>(0);

  // Reset state when src changes
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setRetries(0);
  }, [src]);

  // Process source URL - prioritize Cloudinary images
  const processedSrc = React.useMemo(() => {
    if (!imgSrc) return fallbackSrc;
    
    // For Cloudinary images, return as-is (they're already optimized)
    if (imgSrc.includes('cloudinary.com')) {
      if (debug) console.log(`☁️ Using Cloudinary image: ${imgSrc}`);
      return imgSrc;
    }
    
    // For Google Drive images, convert to proxy URL
    if (imgSrc.includes('drive.google.com')) {
      if (debug) console.log(`🔄 Converting Google Drive URL: ${imgSrc}`);
      return getGoogleDriveProxyUrl(imgSrc, fallbackSrc, debug);
    }
    
    // For local images, return as-is
    if (imgSrc.startsWith('/') || imgSrc.startsWith('data:')) {
      return imgSrc;
    }
    
    // For other external images, return as-is
    return imgSrc;
  }, [imgSrc, fallbackSrc, debug]);

  const handleError = () => {
    if (debug) console.warn(`❌ Image failed to load: ${processedSrc}`);
    
    // Don't retry if we're already showing the fallback image
    if (processedSrc === fallbackSrc) {
      if (debug) console.log(`⚠️ Fallback image also failed to load: ${fallbackSrc}`);
      setHasError(true);
      onError?.();
      return;
    }
    
    // Try retry mechanism
    if (retries < retryCount) {
      if (debug) console.log(`🔄 Retry attempt ${retries + 1}/${retryCount}`);
      setRetries(prev => prev + 1);
      // Force a re-render by adding a timestamp parameter
      const timestamp = new Date().getTime();
      setImgSrc(src + (src.includes('?') ? '&' : '?') + `_t=${timestamp}`);
    } else {
      // All retries failed, use fallback
      if (debug) console.log(`⚠️ All retries failed, using fallback: ${fallbackSrc}`);
      setImgSrc(fallbackSrc);
      setHasError(true);
      onError?.();
    }
  };

  const handleLoad = () => {
    if (debug && retries > 0) console.log(`✅ Image loaded successfully after ${retries} retries`);
    if (debug) console.log(`✅ Image loaded: ${processedSrc}`);
    onLoad?.();
  };

  return (
    <img
      src={hasError ? fallbackSrc : processedSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
}