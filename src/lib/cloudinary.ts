/**
 * Cloudinary image optimization utilities
 * Provides helper functions for generating optimized Cloudinary URLs
 */

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
  crop?: 'scale' | 'fit' | 'fill' | 'limit' | 'pad' | 'lpad' | 'rpad' | 'tpad' | 'bpad' | 'fpad' | 'crop' | 'thumb' | 'mfit' | 'mpad' | 'fill_pad' | 'imagga_crop' | 'imagga_scale';
  gravity?: 'auto' | 'face' | 'faces' | 'body' | 'adv_face' | 'adv_faces' | 'adv_body' | 'custom' | 'center' | 'north' | 'north_east' | 'east' | 'south_east' | 'south' | 'south_west' | 'west' | 'north_west' | 'xy_center';
  radius?: number;
  blur?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  sharpen?: number;
  unsharp_mask?: string;
  effect?: string;
  background?: string;
  color?: string;
  opacity?: number;
  border?: string;
  flags?: string[];
  dpr?: 'auto' | number;
  responsive?: boolean;
  fetch_format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
}

/**
 * Generates an optimized Cloudinary URL with transformations
 * @param publicId - The Cloudinary public ID or full URL
 * @param options - Transformation options
 * @returns Optimized Cloudinary URL
 */
export function getOptimizedCloudinaryUrl(
  publicId: string, 
  options: CloudinaryTransformOptions = {}
): string {
  // If it's already a full Cloudinary URL, extract the public ID
  let cleanPublicId = publicId;
  if (publicId.includes('cloudinary.com')) {
    const urlParts = publicId.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex !== -1 && uploadIndex + 1 < urlParts.length) {
      cleanPublicId = urlParts.slice(uploadIndex + 2).join('/').split('.')[0];
    }
  }

  // Build transformation parameters
  const transformations: string[] = [];

  // Quality optimization
  if (options.quality === 'auto' || options.quality) {
    transformations.push(`q_${options.quality || 'auto'}`);
  }

  // Format optimization
  if (options.format === 'auto' || options.format) {
    transformations.push(`f_${options.format || 'auto'}`);
  }

  // Size transformations
  if (options.width || options.height) {
    let sizeTransform = '';
    if (options.width) sizeTransform += `w_${options.width}`;
    if (options.height) sizeTransform += `,h_${options.height}`;
    if (options.crop) sizeTransform += `,c_${options.crop}`;
    if (options.gravity) sizeTransform += `,g_${options.gravity}`;
    transformations.push(sizeTransform);
  }

  // Effects
  if (options.blur) transformations.push(`e_blur:${options.blur}`);
  if (options.brightness) transformations.push(`e_brightness:${options.brightness}`);
  if (options.contrast) transformations.push(`e_contrast:${options.contrast}`);
  if (options.saturation) transformations.push(`e_saturation:${options.saturation}`);
  if (options.sharpen) transformations.push(`e_sharpen:${options.sharpen}`);
  if (options.effect) transformations.push(`e_${options.effect}`);

  // Border and radius
  if (options.radius) transformations.push(`r_${options.radius}`);
  if (options.border) transformations.push(`bo_${options.border}`);

  // Background
  if (options.background) transformations.push(`b_${options.background}`);
  if (options.color) transformations.push(`co_${options.color}`);

  // Opacity
  if (options.opacity) transformations.push(`o_${options.opacity}`);

  // Flags
  if (options.flags) {
    options.flags.forEach(flag => transformations.push(`fl_${flag}`));
  }

  // DPR (Device Pixel Ratio)
  if (options.dpr) transformations.push(`dpr_${options.dpr}`);

  // Responsive
  if (options.responsive) transformations.push('fl_responsive');

  // Build the final URL
  const cloudName = 'dpeun5lss'; // Your Cloudinary cloud name
  const transformationString = transformations.join(',');
  
  if (transformationString) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}/${cleanPublicId}`;
  } else {
    return `https://res.cloudinary.com/${cloudName}/image/upload/${cleanPublicId}`;
  }
}

/**
 * Generates a responsive image URL for different screen sizes
 * @param publicId - The Cloudinary public ID
 * @param baseOptions - Base transformation options
 * @returns Object with different size URLs
 */
export function getResponsiveCloudinaryUrls(
  publicId: string,
  baseOptions: CloudinaryTransformOptions = {}
) {
  return {
    thumbnail: getOptimizedCloudinaryUrl(publicId, {
      ...baseOptions,
      width: 150,
      height: 150,
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    }),
    small: getOptimizedCloudinaryUrl(publicId, {
      ...baseOptions,
      width: 400,
      height: 400,
      crop: 'limit',
      quality: 'auto',
      format: 'auto'
    }),
    medium: getOptimizedCloudinaryUrl(publicId, {
      ...baseOptions,
      width: 800,
      height: 800,
      crop: 'limit',
      quality: 'auto',
      format: 'auto'
    }),
    large: getOptimizedCloudinaryUrl(publicId, {
      ...baseOptions,
      width: 1200,
      height: 1200,
      crop: 'limit',
      quality: 'auto',
      format: 'auto'
    }),
    original: getOptimizedCloudinaryUrl(publicId, {
      ...baseOptions,
      quality: 'auto',
      format: 'auto'
    })
  };
}

/**
 * Generates a srcset for responsive images
 * @param publicId - The Cloudinary public ID
 * @param baseOptions - Base transformation options
 * @returns Srcset string
 */
export function getCloudinarySrcSet(
  publicId: string,
  baseOptions: CloudinaryTransformOptions = {}
): string {
  const sizes = [400, 800, 1200, 1600];
  
  return sizes
    .map(size => {
      const url = getOptimizedCloudinaryUrl(publicId, {
        ...baseOptions,
        width: size,
        height: size,
        crop: 'limit',
        quality: 'auto',
        format: 'auto'
      });
      return `${url} ${size}w`;
    })
    .join(', ');
}

/**
 * Checks if a URL is a Cloudinary URL
 * @param url - The URL to check
 * @returns True if it's a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('cloudinary.com');
}

/**
 * Extracts the public ID from a Cloudinary URL
 * @param url - The Cloudinary URL
 * @returns The public ID
 */
export function extractCloudinaryPublicId(url: string): string | null {
  if (!isCloudinaryUrl(url)) return null;
  
  const urlParts = url.split('/');
  const uploadIndex = urlParts.findIndex(part => part === 'upload');
  
  if (uploadIndex !== -1 && uploadIndex + 1 < urlParts.length) {
    return urlParts.slice(uploadIndex + 2).join('/').split('.')[0];
  }
  
  return null;
}

/**
 * Default optimization settings for product images
 */
export const PRODUCT_IMAGE_OPTIONS: CloudinaryTransformOptions = {
  quality: 'auto',
  format: 'auto',
  width: 800,
  height: 800,
  crop: 'limit',
  gravity: 'auto',
  responsive: true,
  flags: ['progressive']
};

/**
 * Default optimization settings for thumbnail images
 */
export const THUMBNAIL_IMAGE_OPTIONS: CloudinaryTransformOptions = {
  quality: 'auto',
  format: 'auto',
  width: 300,
  height: 300,
  crop: 'fill',
  gravity: 'auto',
  responsive: true,
  flags: ['progressive']
};

/**
 * Default optimization settings for carousel images
 */
export const CAROUSEL_IMAGE_OPTIONS: CloudinaryTransformOptions = {
  quality: 'auto',
  format: 'auto',
  width: 1200,
  height: 600,
  crop: 'fill',
  gravity: 'auto',
  responsive: true,
  flags: ['progressive']
};
