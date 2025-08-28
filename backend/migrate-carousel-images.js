const fs = require('fs');
const path = require('path');
const carouselStore = require('./store/carouselStore');

/**
 * This script migrates carousel slide images from Google Drive links to local file paths.
 * It extracts filenames from Google Drive URLs and updates them to use the /uploads/ path.
 */

// Function to extract filename from Google Drive URL
function extractFilenameFromGoogleDriveUrl(url) {
  if (!url) return null;
  
  // Check if it's already a local path
  if (url.startsWith('/uploads/')) {
    return url;
  }

  try {
    // Extract filename from Google Drive URL
    // Format: https://drive.google.com/uc?export=view&id=FILE_ID
    // or: https://drive.google.com/file/d/FILE_ID/view
    let filename = '';
    
    if (url.includes('drive.google.com')) {
      // Extract the file ID
      let fileId = '';
      
      if (url.includes('/file/d/')) {
        // Format: https://drive.google.com/file/d/FILE_ID/view
        const parts = url.split('/file/d/');
        if (parts.length > 1) {
          fileId = parts[1].split('/')[0];
        }
      } else if (url.includes('id=')) {
        // Format: https://drive.google.com/uc?export=view&id=FILE_ID
        const parts = url.split('id=');
        if (parts.length > 1) {
          fileId = parts[1].split('&')[0];
        }
      }
      
      if (fileId) {
        // Use the file ID as the filename with a .jpg extension
        filename = `${fileId}.jpg`;
      } else {
        // Fallback: use a timestamp as filename
        filename = `carousel-${Date.now()}.jpg`;
      }
    } else {
      // For other URLs, extract the filename from the path
      const urlPath = new URL(url).pathname;
      filename = path.basename(urlPath);
      
      // If no extension, add .jpg
      if (!path.extname(filename)) {
        filename += '.jpg';
      }
    }
    
    return `/uploads/${filename}`;
  } catch (error) {
    console.error(`Error extracting filename from URL ${url}:`, error);
    return `/uploads/carousel-${Date.now()}.jpg`; // Fallback
  }
}

// Main migration function
async function migrateCarouselImages() {
  console.log('Starting carousel image migration...');
  
  try {
    // Get all carousels
    const carousels = carouselStore.getAll();
    let totalSlides = 0;
    let migratedSlides = 0;
    
    // Process each carousel
    carousels.forEach(carousel => {
      console.log(`Processing carousel: ${carousel.name} (${carousel.slides.length} slides)`);
      
      // Process each slide in the carousel
      carousel.slides.forEach(slide => {
        totalSlides++;
        
        // Skip if already using /uploads/ path
        if (slide.image && slide.image.startsWith('/uploads/')) {
          console.log(`Slide ${slide.id} already using local path: ${slide.image}`);
          return;
        }
        
        // Convert Google Drive URL to local path
        if (slide.image) {
          const localPath = extractFilenameFromGoogleDriveUrl(slide.image);
          if (localPath) {
            console.log(`Migrating slide ${slide.id} image:`);
            console.log(`  From: ${slide.image}`);
            console.log(`  To:   ${localPath}`);
            
            // Update the slide image path
            slide.image = localPath;
            migratedSlides++;
          }
        }
      });
      
      // Update the carousel's updated_at timestamp
      carousel.updated_at = new Date().toISOString();
    });
    
    console.log('\nMigration summary:');
    console.log(`Total slides processed: ${totalSlides}`);
    console.log(`Slides migrated: ${migratedSlides}`);
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Error during carousel image migration:', error);
  }
}

// Run the migration
migrateCarouselImages();