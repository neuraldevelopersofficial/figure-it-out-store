/**
 * Image optimization utilities for better performance
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  blur?: number;
}

/**
 * Generate optimized image URL with parameters
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  if (!originalUrl) return '';

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    blur = 0
  } = options;

  // For Google Drive images, use existing proxy
  if (originalUrl.includes('drive.google.com')) {
    return originalUrl; // Let FallbackImage handle Google Drive optimization
  }

  // For local images, return as is
  if (originalUrl.startsWith('/') || originalUrl.startsWith('data:')) {
    return originalUrl;
  }

  // For external images, you could integrate with image optimization services like:
  // - Cloudinary
  // - ImageKit
  // - Cloudflare Images
  // - Next.js Image Optimization API
  
  // Example with a hypothetical image optimization service:
  // const baseUrl = 'https://images.example.com';
  // const params = new URLSearchParams();
  // if (width) params.append('w', width.toString());
  // if (height) params.append('h', height.toString());
  // params.append('q', quality.toString());
  // params.append('f', format);
  // if (blur > 0) params.append('blur', blur.toString());
  // 
  // return `${baseUrl}/${encodeURIComponent(originalUrl)}?${params.toString()}`;

  return originalUrl;
}

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(
  baseUrl: string,
  sizes: number[] = [320, 640, 768, 1024, 1280, 1536]
): string {
  return sizes
    .map(size => `${getOptimizedImageUrl(baseUrl, { width: size })} ${size}w`)
    .join(', ');
}

/**
 * Generate responsive sizes attribute
 */
export function generateSizes(breakpoints: string[] = [
  '(max-width: 320px) 320px',
  '(max-width: 640px) 640px',
  '(max-width: 768px) 768px',
  '(max-width: 1024px) 1024px',
  '(max-width: 1280px) 1280px',
  '1536px'
]): string {
  return breakpoints.join(', ');
}

/**
 * Check if browser supports WebP format
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * Check if browser supports AVIF format
 */
export function supportsAVIF(): Promise<boolean> {
  return new Promise((resolve) => {
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2);
    };
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEAwgMgkfAAAARHEwQrAQ8QgAAAD6';
  });
}

/**
 * Get the best image format for the current browser
 */
export async function getBestImageFormat(): Promise<'avif' | 'webp' | 'jpeg'> {
  if (await supportsAVIF()) return 'avif';
  if (await supportsWebP()) return 'webp';
  return 'jpeg';
}

/**
 * Generate blur placeholder data URL
 */
export function generateBlurDataURL(width: number = 40, height: number = 40): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';

  // Create a simple gradient blur
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(0.5, '#e5e7eb');
  gradient.addColorStop(1, '#d1d5db');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

/**
 * Preload critical images
 */
export function preloadImage(url: string, priority: 'high' | 'low' = 'low'): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.fetchPriority = priority;
    
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
    
    document.head.appendChild(link);
  });
}

/**
 * Batch preload images
 */
export async function preloadImages(
  urls: string[],
  priority: 'high' | 'low' = 'low'
): Promise<void> {
  const promises = urls.map(url => preloadImage(url, priority));
  await Promise.allSettled(promises);
}

/**
 * Get image dimensions from URL
 */
export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };
    img.src = url;
  });
}

/**
 * Calculate optimal image size based on container and device pixel ratio
 */
export function calculateOptimalImageSize(
  containerWidth: number,
  containerHeight: number,
  devicePixelRatio: number = 1
): { width: number; height: number } {
  return {
    width: Math.ceil(containerWidth * devicePixelRatio),
    height: Math.ceil(containerHeight * devicePixelRatio)
  };
}

/**
 * Check if image is in viewport
 */
export function isImageInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

export default {
  getOptimizedImageUrl,
  generateSrcSet,
  generateSizes,
  supportsWebP,
  supportsAVIF,
  getBestImageFormat,
  generateBlurDataURL,
  preloadImage,
  preloadImages,
  getImageDimensions,
  calculateOptimalImageSize,
  isImageInViewport,
};
