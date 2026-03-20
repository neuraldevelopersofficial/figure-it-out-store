require('dotenv').config();
const cloudinary = require('./config/cloudinary');
const { v2: cloudinaryUpload } = require('cloudinary');
// Use built-in fetch (Node.js 18+)
const fetch = globalThis.fetch;
const fs = require('fs');
const path = require('path');

// Function to check if URL is a Google Drive link
function isGoogleDriveLink(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('drive.google.com') || 
         url.includes('lh3.googleusercontent.com') ||
         /^[a-zA-Z0-9-_]+$/.test(url); // Just file ID
}

// Function to convert Google Drive URL to direct format
function convertGoogleDriveUrl(url) {
  if (!url) return url;
  
  // If it's already a direct export URL, return as is
  if (url.includes('drive.google.com/uc?export=view&id=')) {
    return url;
  }
  
  // Handle Google Drive sharing links
  if (url.includes('drive.google.com/file/d/')) {
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
  
  return url;
}

// Function to upload image from URL to Cloudinary
async function uploadImageToCloudinary(imageUrl, folder = 'figure-it-out-store/products') {
  try {
    console.log(`📤 Uploading: ${imageUrl}`);
    
    // Convert Google Drive URL if needed
    const directUrl = convertGoogleDriveUrl(imageUrl);
    
    // Fetch the image
    const response = await fetch(directUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    
    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      cloudinaryUpload.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: folder,
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 800, height: 800, crop: 'limit' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error(`❌ Upload failed for ${imageUrl}:`, error);
            reject(error);
          } else {
            console.log(`✅ Uploaded: ${result.secure_url}`);
            resolve({
              originalUrl: imageUrl,
              cloudinaryUrl: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes
            });
          }
        }
      ).end(imageBuffer);
    });
    
  } catch (error) {
    console.error(`❌ Error uploading ${imageUrl}:`, error.message);
    throw error;
  }
}

// Function to migrate JSON file images
async function migrateJsonFileImages() {
  try {
    console.log('🚀 Starting JSON file image migration to Cloudinary...');
    
    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary credentials not found in environment variables. Please check your .env file.');
    }
    
    console.log(`☁️  Using Cloudinary cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log('');
    
    // Read the JSON file
    const jsonFilePath = path.join(__dirname, '..', 'Action_figure_completed.json');
    
    if (!fs.existsSync(jsonFilePath)) {
      throw new Error(`JSON file not found: ${jsonFilePath}`);
    }
    
    console.log(`📄 Reading JSON file: ${jsonFilePath}`);
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    
    if (!Array.isArray(jsonData)) {
      throw new Error('JSON file should contain an array of products');
    }
    
    console.log(`📦 Found ${jsonData.length} products to process`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const migrationResults = [];
    
    // Process each product
    for (let i = 0; i < jsonData.length; i++) {
      const product = jsonData[i];
      
      try {
        console.log(`\n📦 Processing product ${i + 1}/${jsonData.length}: ${product.ProductName || product.name || 'Unknown'}`);
        
        let needsUpdate = false;
        const updates = {};
        
        // Process main image
        if (product.ImageLink || product["Image "]) {
          const mainImage = product.ImageLink || product["Image "];
          
          if (mainImage && isGoogleDriveLink(mainImage)) {
            try {
              const uploadResult = await uploadImageToCloudinary(mainImage, 'figure-it-out-store/products');
              updates.ImageLink = uploadResult.cloudinaryUrl;
              updates["Image "] = uploadResult.cloudinaryUrl;
              needsUpdate = true;
              console.log(`✅ Migrated main image for: ${product.ProductName || product.name}`);
            } catch (error) {
              console.error(`❌ Failed to migrate main image for ${product.ProductName || product.name}:`, error.message);
              errorCount++;
            }
          }
        }
        
        // Process additional images (if they exist in the same field)
        if (product["Image "] && product["Image "].includes(',')) {
          const imageUrls = product["Image "].split(',').map(url => url.trim()).filter(Boolean);
          const updatedImages = [];
          let hasChanges = false;
          
          for (const imgUrl of imageUrls) {
            if (isGoogleDriveLink(imgUrl)) {
              try {
                const uploadResult = await uploadImageToCloudinary(imgUrl, 'figure-it-out-store/products');
                updatedImages.push(uploadResult.cloudinaryUrl);
                hasChanges = true;
                console.log(`✅ Migrated additional image for: ${product.ProductName || product.name}`);
              } catch (error) {
                console.error(`❌ Failed to migrate additional image for ${product.ProductName || product.name}:`, error.message);
                updatedImages.push(imgUrl); // Keep original URL if migration fails
                errorCount++;
              }
            } else {
              updatedImages.push(imgUrl);
            }
          }
          
          if (hasChanges) {
            updates["Image "] = updatedImages.join(', ');
            needsUpdate = true;
          }
        }
        
        // Update product if needed
        if (needsUpdate) {
          // Create updated product object
          const updatedProduct = {
            ...product,
            ...updates
          };
          
          migrationResults.push({
            original: product,
            updated: updatedProduct,
            index: i
          });
          
          updatedCount++;
          console.log(`✅ Updated product: ${product.ProductName || product.name}`);
        } else {
          skippedCount++;
          console.log(`⏭️  Skipped product: ${product.ProductName || product.name} (no Google Drive images)`);
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error processing product ${i + 1}:`, error.message);
        errorCount++;
      }
    }
    
    // Save migration results
    const outputPath = path.join(__dirname, '..', 'Action_figure_completed_cloudinary.json');
    const updatedJsonData = migrationResults.map(result => result.updated);
    
    fs.writeFileSync(outputPath, JSON.stringify(updatedJsonData, null, 2));
    
    console.log('\n🎉 JSON file image migration completed!');
    console.log(`✅ Updated: ${updatedCount} products`);
    console.log(`⏭️  Skipped: ${skippedCount} products`);
    console.log(`❌ Errors: ${errorCount} images`);
    console.log(`📄 Updated JSON saved to: ${outputPath}`);
    
    // Create migration report
    const reportPath = path.join(__dirname, '..', 'migration-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      totalProducts: jsonData.length,
      updatedProducts: updatedCount,
      skippedProducts: skippedCount,
      errorCount: errorCount,
      cloudinaryCloud: process.env.CLOUDINARY_CLOUD_NAME,
      outputFile: outputPath,
      results: migrationResults
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Migration report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateJsonFileImages()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = {
  migrateJsonFileImages,
  uploadImageToCloudinary,
  isGoogleDriveLink,
  convertGoogleDriveUrl
};
