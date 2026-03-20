require('dotenv').config();
const { connectToDatabase, getCollection } = require('./config/database');
const cloudinary = require('./config/cloudinary');
const { v2: cloudinaryUpload } = require('cloudinary');
const fetch = require('node-fetch');

const COLLECTIONS = {
  PRODUCTS: 'products',
  CAROUSELS: 'carousels'
};

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
    
    const imageBuffer = await response.buffer();
    
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

// Function to migrate product images
async function migrateProductImages() {
  try {
    console.log('🚀 Starting product image migration to Cloudinary...');
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get products collection
    const productsCollection = await getCollection(COLLECTIONS.PRODUCTS);
    if (!productsCollection) {
      throw new Error('Failed to get products collection. Database may not be configured.');
    }
    
    // Get all products
    const products = await productsCollection.find({}).toArray();
    console.log(`📦 Found ${products.length} products to process`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process each product
    for (const product of products) {
      try {
        let needsUpdate = false;
        const updates = {};
        
        // Process main image
        if (product.image && isGoogleDriveLink(product.image)) {
          try {
            const uploadResult = await uploadImageToCloudinary(product.image, 'figure-it-out-store/products');
            updates.image = uploadResult.cloudinaryUrl;
            needsUpdate = true;
            console.log(`✅ Migrated main image for: ${product.name}`);
          } catch (error) {
            console.error(`❌ Failed to migrate main image for ${product.name}:`, error.message);
            errorCount++;
          }
        }
        
        // Process additional images
        if (Array.isArray(product.images) && product.images.length > 0) {
          const updatedImages = [];
          let hasChanges = false;
          
          for (const imgUrl of product.images) {
            if (isGoogleDriveLink(imgUrl)) {
              try {
                const uploadResult = await uploadImageToCloudinary(imgUrl, 'figure-it-out-store/products');
                updatedImages.push(uploadResult.cloudinaryUrl);
                hasChanges = true;
                console.log(`✅ Migrated additional image for: ${product.name}`);
              } catch (error) {
                console.error(`❌ Failed to migrate additional image for ${product.name}:`, error.message);
                updatedImages.push(imgUrl); // Keep original URL if migration fails
                errorCount++;
              }
            } else {
              updatedImages.push(imgUrl);
            }
          }
          
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
          console.log(`✅ Updated product: ${product.name}`);
        } else {
          skippedCount++;
          console.log(`⏭️  Skipped product: ${product.name} (no Google Drive images)`);
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error processing product ${product.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Product image migration completed!');
    console.log(`✅ Updated: ${updatedCount} products`);
    console.log(`⏭️  Skipped: ${skippedCount} products`);
    console.log(`❌ Errors: ${errorCount} images`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Function to migrate carousel images
async function migrateCarouselImages() {
  try {
    console.log('🚀 Starting carousel image migration to Cloudinary...');
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get carousels collection
    const carouselsCollection = await getCollection(COLLECTIONS.CAROUSELS);
    if (!carouselsCollection) {
      throw new Error('Failed to get carousels collection. Database may not be configured.');
    }
    
    // Get all carousels
    const carousels = await carouselsCollection.find({}).toArray();
    console.log(`🎠 Found ${carousels.length} carousels to process`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process each carousel
    for (const carousel of carousels) {
      try {
        let needsUpdate = false;
        const updates = {};
        
        // Process slides
        if (Array.isArray(carousel.slides) && carousel.slides.length > 0) {
          const updatedSlides = [];
          let hasChanges = false;
          
          for (const slide of carousel.slides) {
            if (slide.image && isGoogleDriveLink(slide.image)) {
              try {
                const uploadResult = await uploadImageToCloudinary(slide.image, 'figure-it-out-store/carousels');
                updatedSlides.push({
                  ...slide,
                  image: uploadResult.cloudinaryUrl
                });
                hasChanges = true;
                console.log(`✅ Migrated carousel image for: ${carousel.name}`);
              } catch (error) {
                console.error(`❌ Failed to migrate carousel image for ${carousel.name}:`, error.message);
                updatedSlides.push(slide); // Keep original slide if migration fails
                errorCount++;
              }
            } else {
              updatedSlides.push(slide);
            }
          }
          
          if (hasChanges) {
            updates.slides = updatedSlides;
            needsUpdate = true;
          }
        }
        
        // Update carousel if needed
        if (needsUpdate) {
          await carouselsCollection.updateOne(
            { _id: carousel._id },
            { $set: updates }
          );
          updatedCount++;
          console.log(`✅ Updated carousel: ${carousel.name}`);
        } else {
          skippedCount++;
          console.log(`⏭️  Skipped carousel: ${carousel.name} (no Google Drive images)`);
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error processing carousel ${carousel.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Carousel image migration completed!');
    console.log(`✅ Updated: ${updatedCount} carousels`);
    console.log(`⏭️  Skipped: ${skippedCount} carousels`);
    console.log(`❌ Errors: ${errorCount} images`);
    
  } catch (error) {
    console.error('❌ Carousel migration failed:', error);
    throw error;
  }
}

// Main migration function
async function migrateAllImages() {
  try {
    console.log('🚀 Starting complete image migration to Cloudinary...');
    console.log('📋 This will migrate all Google Drive images to Cloudinary');
    console.log('⚠️  Make sure you have set up your Cloudinary credentials in .env file');
    console.log('');
    
    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary credentials not found in environment variables. Please check your .env file.');
    }
    
    console.log(`☁️  Using Cloudinary cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log('');
    
    // Migrate product images
    await migrateProductImages();
    console.log('');
    
    // Migrate carousel images
    await migrateCarouselImages();
    
    console.log('\n🎉 All image migrations completed successfully!');
    console.log('💡 Your images are now hosted on Cloudinary with automatic optimization');
    console.log('🚀 This should significantly improve your website loading speed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateAllImages()
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
  migrateProductImages,
  migrateCarouselImages,
  migrateAllImages,
  uploadImageToCloudinary,
  isGoogleDriveLink,
  convertGoogleDriveUrl
};
