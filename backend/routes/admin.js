const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const { getDatabase, getCollection, COLLECTIONS } = require('../config/database');

// Import rate limiter
const { bulkUploadLimiter } = require('../middleware/rateLimiter');

// Middleware to verify JWT token and check admin role
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * Converts Google Drive sharing links to direct image URLs
 * Supports both sharing links and direct file IDs
 */
function convertGoogleDriveUrl(url) {
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

function applyProductDefaults(p) {
  const out = { ...p };
  if (!out.category) out.category = 'Anime Figures';
  out.category_slug = normalizeCategoryToSlug(out.category);
  if (out.stock_quantity === undefined || out.stock_quantity === null) out.stock_quantity = 1;
  if (typeof out.in_stock !== 'boolean') out.in_stock = Number(out.stock_quantity) > 0;
  return out;
}

// Get admin statistics
router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const productsStore = require('../store/productsStore');
    const usersStore = require('../store/usersStore');
    
    // Get real data from stores
    const products = productsStore.getAll();
    const userStats = usersStore.getStats();
    
    // Calculate product statistics
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => (p.stock_quantity || 0) < 10).length;
    
    // Calculate order statistics (mock for now, replace with real order store)
    const totalOrders = userStats.totalOrders;
    const totalRevenue = userStats.totalRevenue;
    const pendingOrders = Math.floor(totalOrders * 0.15); // 15% pending rate
    
    // Get user statistics
    const totalCustomers = userStats.totalCustomers;
    const avgOrderValue = userStats.avgOrderValue;
    
    // Calculate monthly growth (mock for now)
    const monthlyGrowth = 12; // 12% growth
    
    // Get top selling category
    const categoryCounts = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    
    const topSellingCategory = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "Anime Figures";

    const stats = {
      totalProducts,
      totalOrders,
      totalRevenue,
      totalCustomers,
      pendingOrders,
      lowStockProducts,
      monthlyGrowth,
      topSellingCategory,
      avgOrderValue: Math.round(avgOrderValue)
    };

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get all orders for admin
router.get('/orders', authenticateToken, requireAdmin, (req, res) => {
  try {
    // Mock orders data (replace with actual database queries in production)
    const orders = [
      {
        id: "1",
        customer_name: "John Doe",
        customer_email: "john@example.com",
        total_amount: 2500,
        status: "pending",
        payment_status: "completed",
        created_at: "2024-01-15T10:30:00.000Z"
      },
      {
        id: "2",
        customer_name: "Jane Smith",
        customer_email: "jane@example.com",
        total_amount: 1800,
        status: "confirmed",
        payment_status: "completed",
        created_at: "2024-01-14T15:45:00.000Z"
      }
    ];

    res.json({
      success: true,
      orders: orders
    });

  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Helper to access products collection or null
async function getProductsCollection() {
  try {
    const db = await getDatabase();
    if (!db) return null;
    return await getCollection(COLLECTIONS.PRODUCTS);
  } catch (e) {
    return null;
  }
}

// Get all products for admin
router.get('/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const col = await getProductsCollection();
    if (col) {
      const docs = await col.find({}).toArray();
      const products = docs.map(p => ({
        id: p.id || (p._id ? String(p._id) : ''),
        name: p.name || p.ProductName || p['Product Name'] || '',
        category: p.category || p.Category || '',
        price: p.price ?? p.Price ?? 0,
        stock: p.stock_quantity ?? p.StockQuantity ?? 0,
        image: p.image || p.Image || ''
      }));
      return res.json({ success: true, products });
    }
    const store = require('../store/productsStore');
    const products = store.toAdminList();
    res.json({ success: true, products });
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create new product
router.post('/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const store = require('../store/productsStore');
    const { name, price, category, description, stock_quantity, image, original_price, is_new, is_on_sale, discount, in_stock, rating, reviews } = req.body;

    if (!name || !price || !category || !stock_quantity) {
      return res.status(400).json({ error: 'Missing required product fields' });
    }

    // Convert Google Drive URL if present
    const convertedImage = image ? convertGoogleDriveUrl(image) : image;

    const col = await getProductsCollection();
    if (col) {
      const doc = applyProductDefaults(store.add({
        name,
        price,
        category,
        description,
        stock_quantity,
        image: convertedImage,
        original_price,
        is_new,
        is_on_sale,
        discount,
        in_stock,
        rating,
        reviews
      }));
      // Ensure unique id field
      await col.insertOne({ ...doc });
      return res.status(201).json({ success: true, message: 'Product created successfully', product: doc });
    }

    const newProduct = applyProductDefaults(store.add({
      name,
      price,
      category,
      description,
      stock_quantity,
      image: convertedImage,
      original_price,
      is_new,
      is_on_sale,
      discount,
      in_stock,
      rating,
      reviews
    }));

    res.status(201).json({ success: true, message: 'Product created successfully', product: newProduct });

  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const store = require('../store/productsStore');
    const { id } = req.params;
    const updates = applyProductDefaults(req.body || {});

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    // Convert Google Drive URL if image is being updated
    if (updates.image) {
      updates.image = convertGoogleDriveUrl(updates.image);
    }

    const col = await getProductsCollection();
    if (col) {
      const { ObjectId } = require('mongodb');
      const filter = {
        $or: [
          { id: String(id) },
          ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : [])
        ]
      };
      const result = await col.findOneAndUpdate(filter, { $set: { ...updates, updated_at: new Date().toISOString() } }, { returnDocument: 'after' });
      if (!result.value) return res.status(404).json({ error: 'Product not found' });
      return res.json({ success: true, message: 'Product updated successfully', product: result.value });
    }

    const updatedProduct = store.update(id, updates);
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true, message: 'Product updated successfully', product: updatedProduct });

  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const store = require('../store/productsStore');
    const { id } = req.params;

    const col = await getProductsCollection();
    if (col) {
      const { ObjectId } = require('mongodb');
      const filter = {
        $or: [
          { id: String(id) },
          ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : [])
        ]
      };
      const del = await col.deleteOne(filter);
      if (del.deletedCount === 0) return res.status(404).json({ error: 'Product not found' });
      return res.json({ success: true, message: 'Product deleted successfully' });
    }

    const removed = store.remove(id);
    if (!removed) return res.status(404).json({ error: 'Product not found' });

    res.json({ success: true, message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Bulk upsert products via CSV/Excel upload
router.post('/products/bulk', authenticateToken, requireAdmin, bulkUploadLimiter, upload.single('file'), async (req, res) => {
  try {
    const store = require('../store/productsStore');
    const mode = (req.body.mode || 'upsert').toLowerCase(); // 'add' | 'update' | 'upsert'
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'File is required. Upload a CSV or Excel file under field name "file".' });
    }

    // Try to parse as Excel if extension suggests, else CSV
    const originalName = file.originalname || '';
    const lowerName = originalName.toLowerCase();
    let rows = [];

    const toBoolean = (val) => {
      if (typeof val === 'boolean') return val;
      if (val === null || val === undefined) return undefined;
      const s = String(val).trim().toLowerCase();
      if (s === 'true' || s === '1' || s === 'yes') return true;
      if (s === 'false' || s === '0' || s === 'no') return false;
      return undefined;
    };

    const toNumber = (val) => {
      if (val === null || val === undefined || val === '') return undefined;
      const n = Number(val);
      return Number.isFinite(n) ? n : undefined;
    };

    const mapCamelToSnake = (p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: toNumber(p.price),
      original_price: toNumber(p.originalPrice),
      discount: toNumber(p.discount),
      is_on_sale: toBoolean(p.isOnSale),
      is_new: toBoolean(p.isNew),
      image: p.image ? convertGoogleDriveUrl(p.image) : p.image,
      images: p.allImages ? p.allImages.split(',').map(img => convertGoogleDriveUrl(img.trim())).filter(img => img) : [],
      description: p.description || '',
      in_stock: typeof p.inStock === 'boolean' ? p.inStock : undefined,
      rating: toNumber(p.rating),
      reviews: toNumber(p.reviews),
      stock_quantity: toNumber(p.stockQuantity)
    });

    const parseCSV = (buffer) => {
      const text = buffer.toString('utf8');
      // Simple CSV parser supporting quoted fields and commas inside quotes
      const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim().length > 0);
      if (lines.length === 0) return [];
      const parseLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"';
              i++; // skip escaped quote
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current);
        return result.map(v => v.trim());
      };
      const header = parseLine(lines[0]);
      const records = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseLine(lines[i]);
        if (values.every(v => v === '')) continue; // skip empty rows
        const obj = {};
        header.forEach((key, idx) => {
          obj[key] = values[idx] !== undefined ? values[idx] : '';
        });
        records.push(obj);
      }
      return records;
    };

    if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
      try {
        const XLSX = require('xlsx');
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      } catch (e) {
        return res.status(400).json({ error: 'Failed to parse Excel. Ensure the server has the "xlsx" package installed.' });
      }
    } else {
      rows = parseCSV(file.buffer);
    }

    // Normalize keys and build product list in camelCase expected from client
    const normalized = rows.map((r) => {
      const obj = {};
      Object.keys(r).forEach((k) => {
        const key = String(k).trim();
        obj[key] = r[k];
      });
      // Convert to camelCase schema if snake_case provided
      const product = {
        id: obj.id || obj.ID || '',
        name: obj.name || obj.Name,
        category: obj.category || obj.Category,
        price: obj.price ?? obj.Price,
        originalPrice: obj.originalPrice ?? obj.original_price ?? obj.OriginalPrice,
        discount: obj.discount ?? obj.Discount,
        isOnSale: obj.isOnSale ?? obj.is_on_sale ?? obj.IsOnSale,
        isNew: obj.isNew ?? obj.is_new ?? obj.IsNew,
        image: obj.image ?? obj.Image,
        description: obj.description ?? obj.Description,
        inStock: obj.inStock ?? obj.in_stock ?? obj.InStock,
        rating: obj.rating ?? obj.Rating,
        reviews: obj.reviews ?? obj.Reviews,
        stockQuantity: obj.stockQuantity ?? obj.stock_quantity ?? obj.StockQuantity
      };
      return product;
    });

    // Validate minimal required fields
    const errors = [];
    const valid = [];
    normalized.forEach((p, idx) => {
      if (!p.name || !p.category || (p.price === undefined || p.price === '')) {
        errors.push({ row: idx + 2, error: 'Missing required fields: name, category, price' });
        return;
      }
      const mapped = mapCamelToSnake(p);
      // Derive in_stock from stock_quantity if not provided
      if (typeof mapped.in_stock !== 'boolean' && typeof mapped.stock_quantity === 'number') {
        mapped.in_stock = mapped.stock_quantity > 0;
      }
      valid.push(mapped);
    });

    // Apply to MongoDB if available, otherwise in-memory store
    const col = await getProductsCollection();
    let created = 0, updated = 0;
    if (col) {
      for (const p of valid) {
        const id = p.id && String(p.id).trim().length ? String(p.id) : null;
        if (mode === 'add') {
          if (!id) {
            const doc = require('../store/productsStore').add(p);
            await col.insertOne({ ...doc });
            created++;
          }
        } else if (mode === 'update') {
          if (id) {
            const r = await col.updateOne({ id }, { $set: { ...p, updated_at: new Date().toISOString() } });
            if (r.matchedCount) updated++;
          }
        } else {
          // upsert
          const doc = id ? { ...p } : require('../store/productsStore').add(p);
          await col.updateOne({ id: doc.id }, { $set: { ...doc, updated_at: new Date().toISOString() } }, { upsert: true });
          if (id) updated++; else created++;
        }
      }
    } else {
      if (mode === 'add') {
        for (const p of valid) {
          if (!p.id) { store.add(p); created++; }
        }
      } else if (mode === 'update') {
        for (const p of valid) {
          if (p.id) { const u = store.update(p.id, p); if (u) updated++; }
        }
      } else {
        const result = store.upsertMany(valid);
        created = result.created;
        updated = result.updated;
      }
    }

    return res.json({
      success: true,
      mode,
      total: normalized.length,
      processed: valid.length,
      created,
      updated,
      errors
    });
  } catch (error) {
    console.error('Bulk products error:', error);
    res.status(500).json({ error: 'Failed to process bulk products' });
  }
});

// Get all customers for admin
router.get('/customers', authenticateToken, requireAdmin, (req, res) => {
  try {
    const usersStore = require('../store/usersStore');
    const customers = usersStore.getCustomers();

    res.json({
      success: true,
      customers: customers
    });

  } catch (error) {
    console.error('Customers fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

module.exports = router;
