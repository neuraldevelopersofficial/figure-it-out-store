import React, { useState } from 'react';
import { getGoogleDriveProxyUrl } from '@/lib/utils';

interface FallbackImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * A component that renders an image with a fallback if the primary image fails to load
 */
export function FallbackImage({
  src,
  fallbackSrc = '/placeholder-image.png', // Default fallback image
  alt,
  className = '',
  onLoad,
  onError,
  ...props
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [hasError, setHasError] = useState<boolean>(false);

  // Process Google Drive URLs through proxy if needed
  const processedSrc = src?.includes('drive.google.com') 
    ? getGoogleDriveProxyUrl(src, fallbackSrc)
    : src;

  const handleError = () => {
    if (!hasError) {
      console.warn(`Image failed to load: ${src}`);
      setImgSrc(fallbackSrc);
      setHasError(true);
      onError?.();
    }
  };

  const handleLoad = () => {
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