import React, { useState, useEffect } from 'react';
import { getGoogleDriveProxyUrl, convertGoogleDriveUrl } from '@/lib/utils';

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
 * Includes automatic retry and fallback mechanisms for Google Drive images
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
  const [useProxy, setUseProxy] = useState<boolean>(src?.includes('drive.google.com'));

  // Reset state when src changes
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setRetries(0);
    setUseProxy(src?.includes('drive.google.com'));
  }, [src]);

  // Process source URL based on current state
  const processedSrc = React.useMemo(() => {
    if (!imgSrc) return fallbackSrc;
    
    if (useProxy && imgSrc.includes('drive.google.com')) {
      if (debug) console.log(`🖼️ Using proxy for image: ${imgSrc}`);
      return getGoogleDriveProxyUrl(imgSrc, fallbackSrc, debug);
    } else if (imgSrc.includes('drive.google.com')) {
      if (debug) console.log(`🖼️ Using direct Google Drive URL: ${imgSrc}`);
      return convertGoogleDriveUrl(imgSrc, debug);
    }
    
    return imgSrc;
  }, [imgSrc, useProxy, fallbackSrc, debug]);

  const handleError = () => {
    if (debug) console.warn(`❌ Image failed to load: ${processedSrc}`);
    
    // Try different strategies based on the current state
    if (imgSrc.includes('drive.google.com') && !useProxy && retries < retryCount) {
      // First failure with direct URL, try with proxy
      if (debug) console.log(`🔄 Retrying with proxy: ${imgSrc}`);
      setUseProxy(true);
      setRetries(prev => prev + 1);
    } else if (retries < retryCount) {
      // Try one more time with the same strategy
      if (debug) console.log(`🔄 Retry attempt ${retries + 1}/${retryCount}`);
      setRetries(prev => prev + 1);
      // Force a re-render by toggling a timestamp parameter
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