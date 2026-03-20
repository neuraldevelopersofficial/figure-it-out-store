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
 * @param url The Google Drive URL or file ID
 * @param debug Whether to log debug information
 * @returns The converted direct URL
 */
export function convertGoogleDriveUrl(url: string, debug: boolean = false): string {
  if (!url) return '';
  
  try {
    // For debugging
    if (debug) console.log(`🔄 Converting Google Drive URL: ${url}`);
    
    // If it's already a direct image URL, return as is
    if (url.startsWith('http') && (url.includes('drive.google.com/uc') || url.includes('lh3.googleusercontent.com'))) {
      if (debug) console.log(`✅ URL is already in direct format`);
      return url;
    }
    
    // Handle Google Drive sharing links with file/d/ format
    if (url.includes('drive.google.com/file/d/')) {
      // Extract file ID from sharing link
      const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        const fileId = match[1];
        const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        if (debug) console.log(`✅ Converted file/d/ URL to: ${directUrl}`);
        return directUrl;
      }
    }
    
    // Handle Google Drive sharing links with open?id= format
    if (url.includes('drive.google.com/open?id=')) {
      const match = url.match(/id=([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        const fileId = match[1];
        const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        if (debug) console.log(`✅ Converted open?id= URL to: ${directUrl}`);
        return directUrl;
      }
    }
    
    // Handle Google Drive sharing links with view?usp=sharing format
    if (url.includes('drive.google.com') && url.includes('view?usp=sharing')) {
      const match = url.match(/\/d\/([a-zA-Z0-9-_]+)\//);
      if (match && match[1]) {
        const fileId = match[1];
        const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        if (debug) console.log(`✅ Converted view?usp=sharing URL to: ${directUrl}`);
        return directUrl;
      }
    }
    
    // If it's just a file ID, convert to direct URL
    if (/^[a-zA-Z0-9-_]+$/.test(url)) {
      const directUrl = `https://drive.google.com/uc?export=view&id=${url}`;
      if (debug) console.log(`✅ Converted file ID to: ${directUrl}`);
      return directUrl;
    }
    
    // Return original URL if no conversion possible
    if (debug) console.log(`⚠️ No conversion applied, returning original URL`);
    return url;
  } catch (error) {
    console.error('❌ Error converting Google Drive URL:', error);
    return url; // Return original URL in case of error
  }
}

/**
 * Gets a proxy URL for Google Drive images to bypass CORS issues
 * @param url The original image URL
 * @param fallbackUrl Optional fallback URL to use if the image fails to load
 * @param debug Whether to log debug information
 * @returns The proxied URL or fallback URL
 */
export function getGoogleDriveProxyUrl(url: string, fallbackUrl: string = '/placeholder-image.png', debug: boolean = false): string {
  if (!url) {
    if (debug) console.log('⚠️ Empty URL provided to proxy, using fallback');
    return fallbackUrl;
  }
  
  // First convert to direct Google Drive URL format if needed
  const directUrl = convertGoogleDriveUrl(url, debug);
  
  // If it's not a Google Drive URL, return as is
  if (!directUrl.includes('drive.google.com')) {
    if (debug) console.log('ℹ️ Not a Google Drive URL, skipping proxy');
    return directUrl;
  }
  
  try {
    // Use our backend proxy - fix double /api issue
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
    const proxyUrl = `${baseUrl}/products/image-proxy?url=${encodeURIComponent(directUrl)}`;
    
    if (debug) {
      console.log('🔄 Using image proxy for Google Drive URL:');
      console.log(`   Original: ${url}`);
      console.log(`   Direct: ${directUrl}`);
      console.log(`   Proxied: ${proxyUrl}`);
    }
    
    return proxyUrl;
  } catch (error) {
    console.error('❌ Error creating proxy URL:', error);
    if (debug) console.log(`⚠️ Proxy creation failed, using fallback: ${fallbackUrl}`);
    return fallbackUrl || directUrl; // Return fallback or direct URL if encoding fails
  }
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
