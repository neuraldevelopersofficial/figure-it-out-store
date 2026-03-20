const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { v2: cloudinaryUpload } = require('cloudinary');
const router = express.Router();

// Configure multer for memory storage (Cloudinary needs buffer)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit (Cloudinary supports larger files)
  }
});

// Single image upload to Cloudinary
router.post('/single', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinaryUpload.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'figure-it-out-store/products',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 800, height: 800, crop: 'limit' }
        ]
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
        }
        
        res.json({
          success: true,
          message: 'Image uploaded successfully to Cloudinary',
          imageUrl: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes
        });
      }
    ).end(req.file.buffer);

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
  }
});

// Multiple images upload to Cloudinary
router.post('/multiple', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files uploaded' });
    }

    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        cloudinaryUpload.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: 'figure-it-out-store/products',
            transformation: [
              { quality: 'auto', fetch_format: 'auto' },
              { width: 800, height: 800, crop: 'limit' }
            ]
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes
              });
            }
          }
        ).end(file.buffer);
      });
    });

    const results = await Promise.all(uploadPromises);
    
    res.json({
      success: true,
      message: `${results.length} images uploaded successfully to Cloudinary`,
      images: results
    });

  } catch (error) {
    console.error('Multiple Cloudinary upload error:', error);
    res.status(500).json({ error: 'Failed to upload images to Cloudinary' });
  }
});

// Bulk product images upload to Cloudinary
router.post('/bulk-product', upload.array('images', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files uploaded' });
    }

    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        cloudinaryUpload.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: 'figure-it-out-store/products',
            transformation: [
              { quality: 'auto', fetch_format: 'auto' },
              { width: 800, height: 800, crop: 'limit' }
            ]
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve({
                originalName: file.originalname,
                url: result.secure_url,
                publicId: result.public_id,
                filename: result.public_id.split('/').pop(),
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes
              });
            }
          }
        ).end(file.buffer);
      });
    });

    const results = await Promise.all(uploadPromises);
    
    // Create image map for bulk operations
    const imageMap = {};
    results.forEach(result => {
      const originalName = result.originalName.split('.')[0]; // Remove extension
      imageMap[originalName] = result.url;
      imageMap[result.originalName] = result.url;
    });
    
    res.json({
      success: true,
      message: `${results.length} product images uploaded successfully to Cloudinary`,
      images: results,
      imageMap: imageMap
    });

  } catch (error) {
    console.error('Bulk Cloudinary upload error:', error);
    res.status(500).json({ error: 'Failed to upload product images to Cloudinary' });
  }
});

// Upload Google Drive URL to Cloudinary
router.post('/upload-drive-url', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'Google Drive URL is required' });
    }

    // Convert Google Drive URL to direct format
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

    const directUrl = convertGoogleDriveUrl(url);

    // Fetch image from Google Drive
    const response = await fetch(directUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://drive.google.com/'
      }
    });

    if (!response.ok) {
      return res.status(400).json({ 
        error: `Failed to fetch image from Google Drive: ${response.status}`,
        details: response.statusText
      });
    }

    // Get image buffer
    const imageBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinaryUpload.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'figure-it-out-store/products',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 800, height: 800, crop: 'limit' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    res.json({
      success: true,
      message: 'Google Drive image uploaded to Cloudinary successfully',
      originalUrl: url,
      cloudinaryUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    });

  } catch (error) {
    console.error('Google Drive to Cloudinary upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload Google Drive image to Cloudinary',
      details: error.message
    });
  }
});

// Bulk upload Google Drive URLs to Cloudinary
router.post('/bulk-upload-drive-urls', async (req, res) => {
  try {
    const { urls } = req.body;
    
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'Array of Google Drive URLs is required' });
    }

    const uploadPromises = urls.map(async (url, index) => {
      try {
        // Convert Google Drive URL to direct format
        function convertGoogleDriveUrl(url) {
          if (!url) return url;
          
          if (url.includes('drive.google.com/uc?export=view&id=')) {
            return url;
          }
          
          if (url.includes('drive.google.com/file/d/')) {
            const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
            if (match && match[1]) {
              const fileId = match[1];
              return `https://drive.google.com/uc?export=view&id=${fileId}`;
            }
          }
          
          if (url.includes('drive.google.com/open?id=')) {
            const match = url.match(/id=([a-zA-Z0-9-_]+)/);
            if (match && match[1]) {
              const fileId = match[1];
              return `https://drive.google.com/uc?export=view&id=${fileId}`;
            }
          }
          
          if (/^[a-zA-Z0-9-_]+$/.test(url)) {
            return `https://drive.google.com/uc?export=view&id=${url}`;
          }
          
          return url;
        }

        const directUrl = convertGoogleDriveUrl(url);
        
        // Fetch image from Google Drive
        const response = await fetch(directUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://drive.google.com/'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }

        // Get image buffer
        const imageBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(imageBuffer);

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          cloudinaryUpload.uploader.upload_stream(
            {
              resource_type: 'auto',
              folder: 'figure-it-out-store/products',
              transformation: [
                { quality: 'auto', fetch_format: 'auto' },
                { width: 800, height: 800, crop: 'limit' }
              ]
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          ).end(buffer);
        });

        return {
          originalUrl: url,
          cloudinaryUrl: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          success: true
        };

      } catch (error) {
        console.error(`Error processing URL ${index + 1}:`, error);
        return {
          originalUrl: url,
          error: error.message,
          success: false
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    
    // Create URL mapping
    const urlMap = {};
    results.forEach(result => {
      if (result.success) {
        urlMap[result.originalUrl] = result.cloudinaryUrl;
      }
    });

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    res.json({
      success: true,
      message: `Processed ${urls.length} URLs: ${successCount} successful, ${errorCount} failed`,
      results: results,
      urlMap: urlMap,
      successCount: successCount,
      errorCount: errorCount
    });

  } catch (error) {
    console.error('Bulk Google Drive to Cloudinary upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process Google Drive URLs',
      details: error.message
    });
  }
});

// Delete image from Cloudinary
router.delete('/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Extract public ID from URL if needed
    const cleanPublicId = publicId.includes('http') ? 
      publicId.split('/').slice(-2).join('/').split('.')[0] : 
      publicId;

    const result = await cloudinaryUpload.uploader.destroy(cleanPublicId);
    
    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully from Cloudinary'
      });
    } else {
      res.status(404).json({ error: 'Image not found in Cloudinary' });
    }
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    res.status(500).json({ error: 'Failed to delete image from Cloudinary' });
  }
});

// Get optimized image URL with transformations
router.get('/optimize/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const { width, height, quality, format } = req.query;
    
    const transformations = [];
    
    if (width || height) {
      transformations.push({
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        crop: 'limit'
      });
    }
    
    if (quality) {
      transformations.push({ quality: quality });
    }
    
    if (format) {
      transformations.push({ fetch_format: format });
    }
    
    // Default optimizations
    transformations.push(
      { quality: 'auto' },
      { fetch_format: 'auto' }
    );
    
    const optimizedUrl = cloudinary.url(publicId, {
      transformation: transformations
    });
    
    res.json({
      success: true,
      optimizedUrl: optimizedUrl,
      publicId: publicId,
      transformations: transformations
    });
    
  } catch (error) {
    console.error('Cloudinary optimization error:', error);
    res.status(500).json({ error: 'Failed to generate optimized image URL' });
  }
});

module.exports = router;
