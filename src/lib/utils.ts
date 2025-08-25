import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Normalize category to canonical route slug used in the app
// Maps singular/plural and arbitrary spacing/case to the correct slug
export function toCategorySlug(input: string): string {
  const slug = String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const aliases: Record<string, string> = {
    'anime-figure': 'anime-figures',
    'anime-figures': 'anime-figures',
    'keychain': 'keychains',
    'keychains': 'keychains',
  };

  return aliases[slug] || slug;
}

/**
 * Converts Google Drive sharing links to direct image URLs
 * Supports both sharing links and direct file IDs
 */
export function convertGoogleDriveUrl(url: string): string {
  if (!url) return '';
  
  // If it's already a direct image URL, return as is
  if (url.startsWith('http') && (url.includes('drive.google.com/uc') || url.includes('lh3.googleusercontent.com'))) {
    return url;
  }
  
  // Handle Google Drive sharing links
  if (url.includes('drive.google.com/file/d/')) {
    // Extract file ID from sharing link
    const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }
  
  // Handle Google Drive sharing links with /view
  if (url.includes('drive.google.com/open?id=')) {
    const match = url.match(/id=([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }
  
  // If it's just a file ID, convert to direct URL
  if (/^[a-zA-Z0-9-_]+$/.test(url)) {
    return `https://drive.google.com/uc?export=view&id=${url}`;
  }
  
  // Return original URL if no conversion possible
  return url;
}

/**
 * Gets a proxy URL for Google Drive images to bypass CORS issues
 */
export function getGoogleDriveProxyUrl(url: string): string {
  if (!url) return '';
  
  // If it's not a Google Drive URL, return as is
  if (!url.includes('drive.google.com')) {
    return url;
  }
  
  // Use our backend proxy
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${apiUrl}/api/products/image-proxy?url=${encodeURIComponent(url)}`;
}

/**
 * Validates if a URL is a valid Google Drive link or direct image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Direct image URLs
  if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return true;
  
  // Google Drive URLs
  if (url.includes('drive.google.com')) return true;
  
  // Other common image hosting services
  if (url.includes('lh3.googleusercontent.com')) return true;
  if (url.includes('images.unsplash.com')) return true;
  if (url.includes('picsum.photos')) return true;
  
  return false;
}

/**
 * Tests if a Google Drive image is accessible and returns a working URL
 */
export async function testGoogleDriveImage(url: string): Promise<{ accessible: boolean; workingUrl: string; error?: string }> {
  try {
    const convertedUrl = convertGoogleDriveUrl(url);
    
    // If it's not a Google Drive URL, return success
    if (!convertedUrl.includes('drive.google.com')) {
      return { accessible: true, workingUrl: convertedUrl };
    }
    
    // Test the Google Drive URL
    const response = await fetch(convertedUrl, { method: 'HEAD' });
    
    if (response.ok) {
      return { accessible: true, workingUrl: convertedUrl };
    } else if (response.status === 403) {
      return { 
        accessible: false, 
        workingUrl: convertedUrl, 
        error: 'Image is not publicly accessible. Please set permissions to "Anyone with the link can view" in Google Drive.' 
      };
    } else if (response.status === 404) {
      return { 
        accessible: false, 
        workingUrl: convertedUrl, 
        error: 'Image not found. Please check if the file exists and is shared correctly.' 
      };
    } else {
      return { 
        accessible: false, 
        workingUrl: convertedUrl, 
        error: `Failed to access image (Status: ${response.status})` 
      };
    }
  } catch (error) {
    // If fetch fails due to CORS, suggest using the proxy
    return { 
      accessible: false, 
      workingUrl: getGoogleDriveProxyUrl(url), 
      error: 'CORS error - use proxy URL instead' 
    };
  }
}
