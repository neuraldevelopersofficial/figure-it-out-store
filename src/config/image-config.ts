/**
 * Image optimization configuration
 */

export const IMAGE_CONFIG = {
  // Default image quality
  DEFAULT_QUALITY: 80,
  
  // Image formats in order of preference
  FORMATS: ['avif', 'webp', 'jpeg'] as const,
  
  // Responsive breakpoints
  BREAKPOINTS: {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  
  // Image sizes for different use cases
  SIZES: {
    thumbnail: 150,
    small: 300,
    medium: 600,
    large: 900,
    xlarge: 1200,
    hero: 1920,
  },
  
  // Lazy loading configuration
  LAZY_LOADING: {
    rootMargin: '50px',
    threshold: 0.1,
  },
  
  // Preloading configuration
  PRELOADING: {
    criticalImages: 3, // Number of critical images to preload
    adjacentImages: 2, // Number of adjacent images to preload
  },
  
  // Service Worker configuration
  CACHING: {
    imageCacheName: 'figure-it-out-images-v1',
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    maxCacheAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  
  // Placeholder configuration
  PLACEHOLDERS: {
    blur: true,
    skeleton: true,
    color: '#f3f4f6',
  },
  
  // Error handling
  ERROR_HANDLING: {
    maxRetries: 3,
    retryDelay: 1000,
    fallbackImage: '/placeholder-image.png',
  },
} as const;

export type ImageSize = keyof typeof IMAGE_CONFIG.SIZES;
export type ImageFormat = typeof IMAGE_CONFIG.FORMATS[number];
export type Breakpoint = keyof typeof IMAGE_CONFIG.BREAKPOINTS;

/**
 * Get image size for a specific use case
 */
export function getImageSize(size: ImageSize): number {
  return IMAGE_CONFIG.SIZES[size];
}

/**
 * Get responsive image sizes
 */
export function getResponsiveSizes(): string {
  return Object.entries(IMAGE_CONFIG.BREAKPOINTS)
    .map(([breakpoint, width]) => {
      if (breakpoint === 'xs') return `${width}px`;
      return `(max-width: ${width}px) ${width}px`;
    })
    .join(', ') + ', 100vw';
}

/**
 * Get responsive srcset
 */
export function getResponsiveSrcSet(baseUrl: string): string {
  return Object.values(IMAGE_CONFIG.BREAKPOINTS)
    .map(width => `${baseUrl}?w=${width} ${width}w`)
    .join(', ');
}

/**
 * Check if image should be preloaded based on priority
 */
export function shouldPreloadImage(index: number, total: number): boolean {
  return index < IMAGE_CONFIG.PRELOADING.criticalImages;
}

/**
 * Get optimal image format for current browser
 */
export async function getOptimalFormat(): Promise<ImageFormat> {
  // Check browser support for different formats
  if (typeof window === 'undefined') return 'jpeg';
  
  // Check AVIF support
  const avifSupported = await new Promise<boolean>((resolve) => {
    const avif = new Image();
    avif.onload = avif.onerror = () => resolve(avif.height === 2);
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEAwgMgkfAAAARHEwQrAQ8QgAAAD6';
  });
  
  if (avifSupported) return 'avif';
  
  // Check WebP support
  const webpSupported = await new Promise<boolean>((resolve) => {
    const webp = new Image();
    webp.onload = webp.onerror = () => resolve(webp.height === 2);
    webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
  
  if (webpSupported) return 'webp';
  
  return 'jpeg';
}

export default IMAGE_CONFIG;
