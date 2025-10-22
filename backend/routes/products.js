const express = require('express');
const router = express.Router();
const store = require('../store/productsStore');
const { getDatabase, getCollection, COLLECTIONS } = require('../config/database');

// Helper: try to get MongoDB collection; return null if DB not configured
async function getProductsCollection() {
  try {
    const db = await getDatabase();
    if (!db) return null;
    return await getCollection(COLLECTIONS.PRODUCTS);
  } catch (e) {
    return null;
  }
}

// Helper: normalize DB product document to API snake_case expected by frontend mapper
function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeCategoryToSlug(input) {
  const raw = slugify(input);
  const alias = {
    'anime-figure': 'anime-figures',
    'anime-figures': 'anime-figures',
    'keychain': 'keychains',
    'keychains': 'keychains'
  };
  return alias[raw] || raw;
}

function mapDbProductToApi(doc) {
  if (!doc) return null;
  const id = doc.id ? String(doc.id) : (doc._id ? String(doc._id) : undefined);
  const name = doc.name || doc.ProductName || doc['Product Name'] || '';
  const price = doc.price ?? doc.Price ?? 0;
  const original_price = doc.original_price ?? doc.OriginalPrice;
  const image = doc.image || doc.Image || '';
  const images = Array.isArray(doc.images) ? doc.images : (doc.AllImages || doc.allImages ? String(doc.AllImages || doc.allImages).split(',').map(s => s.trim()).filter(Boolean) : []);
  const category = doc.category || doc.Category || 'Anime Figures';
  const category_slug = normalizeCategoryToSlug(doc.category_slug || category);
  const description = doc.description || doc.Description || '';
  const stock_quantity = doc.stock_quantity ?? doc.StockQuantity ?? 0;
  const in_stock = typeof doc.in_stock === 'boolean' ? doc.in_stock : (Number(stock_quantity) > 0);
  const is_new = doc.is_new ?? doc.IsNew;
  const is_on_sale = doc.is_on_sale ?? doc.IsOnSale;
  const powerPoints = doc.powerPoints ?? doc.PowerPoints ?? 50;
  return {
    id,
    name,
    price: Number(price) || 0,
    original_price: original_price !== undefined ? Number(original_price) : undefined,
    image,
    images,
    category,
    category_slug,
    description,
    stock_quantity: Number(stock_quantity) || 0,
    in_stock,
    is_new: typeof is_new === 'boolean' ? is_new : undefined,
    is_on_sale: typeof is_on_sale === 'boolean' ? is_on_sale : undefined,
    powerPoints: Number(powerPoints) || 50,
    created_at: doc.created_at || new Date().toISOString(),
    updated_at: doc.updated_at || new Date().toISOString()
  };
}

// Get all products
router.get('/', async (req, res) => {
  try {
    const col = await getProductsCollection();
    if (col) {
      const docs = await col.find({}).toArray();
      const products = docs.map(mapDbProductToApi);
      return res.json({ success: true, products });
    }
    // Fallback to in-memory store
    return res.json({ success: true, products: store.getAll() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Google Drive image proxy - bypasses CORS issues (MUST BE BEFORE /:id route)
router.options('/image-proxy', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Max-Age': '86400',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  });
  res.status(200).end();
});

router.get('/image-proxy', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // For Cloudinary images, redirect directly (no proxy needed)
    if (url.includes('cloudinary.com')) {
      return res.redirect(url);
    }

    // Convert Google Drive URL to direct format
    function convertGoogleDriveUrl(url) {
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
    
    // Set timeout for fetch to avoid hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      // Fetch the image from Google Drive with better headers
      const response = await fetch(directUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://drive.google.com/'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`❌ Image proxy failed: ${response.status} - ${response.statusText}`);
        
        // For 404 errors, try to serve a default placeholder image
        if (response.status === 404) {
          return res.redirect('/placeholder-image.png');
        }
        
        return res.status(response.status).json({ 
          error: `Failed to fetch image: ${response.status}`,
          details: response.statusText,
          originalUrl: url,
          convertedUrl: directUrl
        });
      }

      // Get image content and headers
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const contentLength = response.headers.get('content-length');
      
      // Set appropriate headers with proper CORS
      res.set({
        'Content-Type': contentType,
        'Content-Length': contentLength,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
        'Cross-Origin-Resource-Policy': 'cross-origin'
      });

      // Convert response to buffer and send (Node.js fetch compatibility)
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError; // Re-throw to be caught by outer try/catch
    }
  } catch (error) {
    console.error('❌ Image proxy error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      originalUrl: req.query.url,
      query: req.query
    });
    
    // For abort errors (timeouts), provide a specific message
    if (error.name === 'AbortError') {
      return res.status(504).json({
        error: 'Request timed out',
        details: 'The image request took too long to complete',
        originalUrl: req.query.url
      });
    }
    
    // Try to serve a default placeholder image for any error
    try {
      return res.redirect('/placeholder-image.png');
    } catch (redirectError) {
      // If redirect fails, send JSON error
      res.status(500).json({ 
        error: 'Failed to proxy image',
        details: error.message,
        originalUrl: req.query.url
      });
    }
  }
});

// Get products by category
router.options('/category/:category', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  });
  res.status(200).end();
});

router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const col = await getProductsCollection();
    if (col) {
      // Improved category matching with more flexible regex
      // This allows for case insensitive partial matches and handles slug variations
      const docs = await col.find({
        $or: [
          { category: { $regex: category, $options: 'i' } },
          { category_slug: { $regex: category, $options: 'i' } }
        ]
      }).toArray();
      
      // Category filter applied
      
      const products = docs.map(mapDbProductToApi);
      return res.json({ success: true, products, category });
    }
    const categoryProducts = store.getByCategory(category);
    res.json({ success: true, products: categoryProducts, category });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Failed to fetch products by category' });
  }
});

// Search products
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Search query required' });
    const col = await getProductsCollection();
    if (col) {
      // Prefer text search, fallback to regex if text index not available
      let docs = [];
      try {
        docs = await col.find({ $text: { $search: String(q) } }).toArray();
      } catch (_) {
        docs = await col.find({
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } }
          ]
        }).toArray();
      }
      const products = docs.map(mapDbProductToApi);
      return res.json({ success: true, products, query: q, total: products.length });
    }
    const searchResults = store.search(q);
    res.json({ success: true, products: searchResults, query: q, total: searchResults.length });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get product by ID (MUST BE LAST to avoid conflicts)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const col = await getProductsCollection();
    if (col) {
      // Improved query to handle ObjectId validation more safely
      let query = { $or: [{ id: String(id) }] };
      
      // Only attempt to use ObjectId if it's a valid format
      const { ObjectId } = require('mongodb');
      if (id.match(/^[0-9a-fA-F]{24}$/) && ObjectId.isValid(id)) {
        query.$or.push({ _id: new ObjectId(id) });
      }
      
      const doc = await col.findOne(query);
      
      if (!doc) {
        // Try fallback to in-memory store
        const fallbackProduct = store.getById(id);
        if (fallbackProduct) {
          return res.json({ success: true, product: fallbackProduct });
        }
        return res.status(404).json({ error: 'Product not found' });
      }
      
      const product = mapDbProductToApi(doc);
      return res.json({ success: true, product });
    }
    
    // Fallback to in-memory store if no MongoDB
    const product = store.getById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error('❌ Error fetching product by ID:', error);
    res.status(500).json({ error: 'Failed to fetch product', details: error.message });
  }
});

module.exports = router;
