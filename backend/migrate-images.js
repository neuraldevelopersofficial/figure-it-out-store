/**
 * Migration script to update product images to use the new storage approach
 * This script converts Google Drive links to local file paths
 */

const { connectToDatabase, getCollection, COLLECTIONS } = require('./config/database');

// Function to check if a URL is a Google Drive link
function isGoogleDriveLink(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('drive.google.com') || 
         url.includes('docs.google.com') || 
         url.includes('googleusercontent.com');
}

// Function to extract filename from a URL
function extractFilenameFromUrl(url) {
  if (!url || typeof url !== 'string') return '';
  
  // Try to extract a filename with extension
  const filenameMatch = url.match(/[\w-]+\.(jpg|jpeg|png|gif|webp)/i);
  if (filenameMatch) return filenameMatch[0];
  
  // If no filename found, generate one using the last part of the URL or a Google Drive ID
  if (isGoogleDriveLink(url)) {
    // Extract Google Drive file ID
    const idMatch = url.match(/id=([\w-]+)/) || url.match(/\/d\/([\w-]+)/);
    if (idMatch) return `google-drive-${idMatch[1]}.jpg`;
  }
  
  // Fallback: use the last segment of the URL path
  const urlParts = url.split('/');
  const lastPart = urlParts[urlParts.length - 1].split('?')[0] || 'image';
  return `${lastPart}.jpg`;
}

async function migrateProductImages() {
  try {
    console.log('Starting product image migration...');
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get products collection
    const productsCollection = await getCollection(COLLECTIONS.PRODUCTS);
    if (!productsCollection) {
      throw new Error('Failed to get products collection. Database may not be configured.');
    }
    
    // Get all products
    const products = await productsCollection.find({}).toArray();
    console.log(`Found ${products.length} products to process`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Process each product
    for (const product of products) {
      let needsUpdate = false;
      const updates = {};
      
      // Process main image
      if (product.image && isGoogleDriveLink(product.image)) {
        const filename = extractFilenameFromUrl(product.image);
        updates.image = `/uploads/${filename}`;
        needsUpdate = true;
      }
      
      // Process additional images
      if (Array.isArray(product.images) && product.images.length > 0) {
        const updatedImages = product.images.map(imgUrl => {
          if (isGoogleDriveLink(imgUrl)) {
            const filename = extractFilenameFromUrl(imgUrl);
            return `/uploads/${filename}`;
          }
          return imgUrl;
        });
        
        // Check if any images were updated
        const hasChanges = updatedImages.some((img, idx) => img !== product.images[idx]);
        if (hasChanges) {
          updates.images = updatedImages;
          needsUpdate = true;
        }
      }
      
      // Update product if needed
      if (needsUpdate) {
        await productsCollection.updateOne(
          { _id: product._id },
          { $set: updates }
        );
        updatedCount++;
        console.log(`Updated product: ${product.name}`);
      } else {
        skippedCount++;
      }
    }
    
    console.log('Migration completed successfully!');
    console.log(`Updated: ${updatedCount} products`);
    console.log(`Skipped: ${skippedCount} products (already using new format)`);
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    process.exit(0);
  }
}

// Run the migration
migrateProductImages();