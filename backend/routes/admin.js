const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
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
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }
    
    // Get products from database
    const productsCollection = await getCollection(COLLECTIONS.PRODUCTS);
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const ordersCollection = await getCollection(COLLECTIONS.ORDERS);
    
    if (!productsCollection || !usersCollection || !ordersCollection) {
      return res.status(500).json({ error: 'Required collections not available' });
    }
    
    // Get product statistics
    const totalProducts = await productsCollection.countDocuments();
    const lowStockProducts = await productsCollection.countDocuments({ stock_quantity: { $lt: 10 } });
    
    // Get user statistics
    const totalCustomers = await usersCollection.countDocuments({ role: 'customer' });
    
    // Get order statistics
    const orders = await ordersCollection.find({}).toArray();
    const totalOrders = orders.length;
    
    // Calculate revenue and pending orders
    let totalRevenue = 0;
    let pendingOrders = 0;
    
    orders.forEach(order => {
      totalRevenue += order.total_amount || 0;
      if (order.status === 'pending') {
        pendingOrders++;
      }
    });
    
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Get top selling category
    const products = await productsCollection.find({}).toArray();
    const categoryCounts = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    
    const topSellingCategory = Object.entries(categoryCounts).length > 0 ?
      Object.entries(categoryCounts).sort(([,a], [,b]) => Number(b) - Number(a))[0]?.[0] : "Anime Figures";

    // Calculate monthly growth (placeholder for now)
    const monthlyGrowth = 12; // 12% growth - this would need actual calculation in production

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
router.get('/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const ordersCollection = await getCollection(COLLECTIONS.ORDERS);
    if (!ordersCollection) {
      return res.status(500).json({ error: 'Orders collection not available' });
    }
    
    const orders = await ordersCollection.find({}).toArray();

    res.json({
      success: true,
      orders: orders
    });

  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status for admin (no user restrictions)
router.put('/orders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    console.log('Admin updating order status:', { order_id: id, new_status: status, admin_id: req.user.id });

    // Check if COLLECTIONS.ORDERS is defined
    if (!COLLECTIONS.ORDERS) {
      console.error('❌ COLLECTIONS.ORDERS is not defined');
      return res.status(500).json({ error: 'Orders collection configuration not available' });
    }

    console.log('🔍 Getting orders collection:', COLLECTIONS.ORDERS);
    const ordersCollection = await getCollection(COLLECTIONS.ORDERS);
    
    if (ordersCollection) {
      console.log('✅ Orders collection obtained successfully');
      
      // First, let's check if the order exists
      const existingOrder = await ordersCollection.findOne({ id: id });
      console.log('🔍 Admin order lookup result:', { 
        order_id: id, 
        found: !!existingOrder,
        order_user_id: existingOrder?.user_id || existingOrder?.userId,
        admin_id: req.user.id
      });
      
      if (!existingOrder) {
        console.log('❌ Order not found in database for admin update:', { order_id: id, admin_id: req.user.id });
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Update the order status (no user restrictions for admin)
      console.log('🔄 Updating order status in database...');
      const result = await ordersCollection.findOneAndUpdate(
        { id: id },
        { $set: { status, updated_at: new Date().toISOString() } },
        { returnOriginal: false }
      );
      
      console.log('🔍 Update result:', { 
        success: !!result, 
        hasValue: !!result?.value,
        resultValue: result?.value ? 'present' : 'missing'
      });
      
      if (!result || !result.value) {
        console.log('❌ Failed to update order status in database:', { order_id: id, admin_id: req.user.id });
        return res.status(500).json({ error: 'Failed to update order status' });
      }
      
      console.log('✅ Admin order status updated in database:', { order_id: id, new_status: status });
      return res.json({ success: true, message: 'Order status updated successfully', order: result.value });
    } else {
      console.log('⚠️ Database not available, using in-memory orders store');
      
      // Fallback to in-memory storage
      const ordersStore = require('../store/ordersStore');
      const order = ordersStore.getOrderById(id);
      
      if (!order) {
        console.log('❌ Order not found in memory store:', { order_id: id, admin_id: req.user.id });
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Update order in memory store
      order.status = status;
      order.updated_at = new Date().toISOString();
      
      console.log('✅ Admin order status updated in memory:', { order_id: id, new_status: status });
      return res.json({ success: true, message: 'Order status updated successfully', order: order });
    }

  } catch (error) {
    console.error('❌ Admin order status update error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Delete order for admin
router.delete('/orders/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Admin deleting order:', { order_id: id, admin_id: req.user.id });

    // Check if COLLECTIONS.ORDERS is defined
    if (!COLLECTIONS.ORDERS) {
      console.error('❌ COLLECTIONS.ORDERS is not defined');
      return res.status(500).json({ error: 'Orders collection configuration not available' });
    }

    console.log('🔍 Getting orders collection:', COLLECTIONS.ORDERS);
    const ordersCollection = await getCollection(COLLECTIONS.ORDERS);
    
    if (ordersCollection) {
      console.log('✅ Orders collection obtained successfully');
      
      // First, let's check if the order exists
      const existingOrder = await ordersCollection.findOne({ id: id });
      console.log('🔍 Admin order lookup for deletion:', { 
        order_id: id, 
        found: !!existingOrder,
        order_user_id: existingOrder?.user_id || existingOrder?.userId,
        admin_id: req.user.id
      });
      
      if (!existingOrder) {
        console.log('❌ Order not found in database for deletion:', { order_id: id, admin_id: req.user.id });
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Delete the order
      console.log('🔄 Deleting order from database...');
      const result = await ordersCollection.deleteOne({ id: id });
      
      console.log('🔍 Delete result:', { 
        success: !!result, 
        deletedCount: result?.deletedCount,
        acknowledged: result?.acknowledged
      });
      
      if (!result || result.deletedCount === 0) {
        console.log('❌ Failed to delete order from database:', { order_id: id, admin_id: req.user.id });
        return res.status(500).json({ error: 'Failed to delete order' });
      }
      
      console.log('✅ Admin order deleted from database:', { order_id: id });
      return res.json({ success: true, message: 'Order deleted successfully' });
    } else {
      console.log('⚠️ Database not available, using in-memory orders store');
      
      // Fallback to in-memory storage
      const ordersStore = require('../store/ordersStore');
      const order = ordersStore.getOrderById(id);
      
      if (!order) {
        console.log('❌ Order not found in memory store for deletion:', { order_id: id, admin_id: req.user.id });
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Delete order from memory store
      const deleted = ordersStore.deleteOrder(id);
      
      if (!deleted) {
        console.log('❌ Failed to delete order from memory store:', { order_id: id, admin_id: req.user.id });
        return res.status(500).json({ error: 'Failed to delete order' });
      }
      
      console.log('✅ Admin order deleted from memory:', { order_id: id });
      return res.json({ success: true, message: 'Order deleted successfully' });
    }

  } catch (error) {
    console.error('❌ Admin order deletion error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Bulk delete orders for admin
router.delete('/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { orderIds } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: 'Order IDs array is required' });
    }
    
    console.log('Admin bulk deleting orders:', { order_ids: orderIds, admin_id: req.user.id });

    // Check if COLLECTIONS.ORDERS is defined
    if (!COLLECTIONS.ORDERS) {
      console.error('❌ COLLECTIONS.ORDERS is not defined');
      return res.status(500).json({ error: 'Orders collection configuration not available' });
    }

    console.log('🔍 Getting orders collection:', COLLECTIONS.ORDERS);
    const ordersCollection = await getCollection(COLLECTIONS.ORDERS);
    
    if (ordersCollection) {
      console.log('✅ Orders collection obtained successfully');
      
      // Delete multiple orders
      console.log('🔄 Bulk deleting orders from database...');
      const result = await ordersCollection.deleteMany({ id: { $in: orderIds } });
      
      console.log('🔍 Bulk delete result:', { 
        success: !!result, 
        deletedCount: result?.deletedCount,
        acknowledged: result?.acknowledged
      });
      
      console.log('✅ Admin bulk order deletion from database:', { 
        order_ids: orderIds, 
        deleted_count: result.deletedCount 
      });
      return res.json({ 
        success: true, 
        message: `${result.deletedCount} orders deleted successfully`,
        deletedCount: result.deletedCount
      });
    } else {
      console.log('⚠️ Database not available, using in-memory orders store');
      
      // Fallback to in-memory storage
      const ordersStore = require('../store/ordersStore');
      let deletedCount = 0;
      
      for (const orderId of orderIds) {
        const deleted = ordersStore.deleteOrder(orderId);
        if (deleted) {
          deletedCount++;
        }
      }
      
      console.log('✅ Admin bulk order deletion from memory:', { 
        order_ids: orderIds, 
        deleted_count: deletedCount 
      });
      return res.json({ 
        success: true, 
        message: `${deletedCount} orders deleted successfully`,
        deletedCount: deletedCount
      });
    }

  } catch (error) {
    console.error('❌ Admin bulk order deletion error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ error: 'Failed to delete orders' });
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
        image: p.image || p.Image || '',
        images: p.images || []
      }));
      return res.json({ success: true, products });
    }
    
    // If database is not available, use in-memory store as fallback
    const store = require('../store/productsStore');
    // Note: productsStore doesn't need initialization like ordersStore does
    const products = await store.getAll();
    const adminList = products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock_quantity,
      image: p.image,
      images: p.images || []
    }));
    res.json({ success: true, products: adminList });
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create new product
router.post('/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const store = require('../store/productsStore');
    await store.init(); // Ensure store is initialized
    
    const { name, price, category, description, stock_quantity, image, original_price, is_new, is_on_sale, discount, in_stock, powerPoints } = req.body;

    // Debug: Log the received data
    console.log('🔍 Backend - Received product data:', req.body);
    console.log('🔍 Backend - Required fields check:', {
      name: !!name,
      price: !!price,
      category: !!category,
      stock_quantity: !!stock_quantity,
      nameValue: name,
      priceValue: price,
      categoryValue: category,
      stock_quantityValue: stock_quantity
    });

    if (!name || !price || !category || !stock_quantity) {
      console.log('❌ Backend - Missing required fields:', {
        name: name,
        price: price,
        category: category,
        stock_quantity: stock_quantity
      });
      return res.status(400).json({ error: 'Missing required product fields' });
    }

    // Convert Google Drive URL if present
    const convertedImage = image ? convertGoogleDriveUrl(image) : image;

    const productData = applyProductDefaults({
      id: uuidv4(),
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
      powerPoints: powerPoints || 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const col = await getProductsCollection();
    if (col) {
      // Insert directly into MongoDB collection
      await col.insertOne({ ...productData });
      return res.status(201).json({ success: true, message: 'Product created successfully', product: productData });
    }

    // Fallback to in-memory store if database is not available
    const newProduct = await store.add(productData);
    res.status(201).json({ success: true, message: 'Product created successfully', product: newProduct });

  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (supports both ID and name-based updates)
router.put('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const store = require('../store/productsStore');
    await store.init(); // Ensure store is initialized
    
    const { id } = req.params;
    
    // Debug: Log the update request
    console.log('🔍 Backend - Update product request:', {
      id: id,
      body: req.body,
      updates: req.body
    });
    
    const updates = applyProductDefaults(req.body || {});

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    // Convert Google Drive URL if image is being updated
    if (updates.image) {
      try {
        updates.image = convertGoogleDriveUrl(updates.image);
      } catch (error) {
        console.error('Error converting Google Drive URL:', error);
        // Continue with the original URL if conversion fails
      }
    }
    
    // Process additional images if present
    if (updates.images && Array.isArray(updates.images)) {
      try {
        updates.images = updates.images.map(img => {
          try {
            return img.includes('drive.google.com') ? convertGoogleDriveUrl(img) : img;
          } catch (e) {
            console.error('Error converting image URL in array:', e);
            return img; // Return original URL if conversion fails
          }
        });
      } catch (error) {
        console.error('Error processing image array:', error);
      }
    }

    const col = await getProductsCollection();
    if (col) {
      const { ObjectId } = require('mongodb');
      
      // First try to find by ID
      let filter = {
        $or: [
          { id: String(id) },
          ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : [])
        ]
      };
      
      // Log the filter and ID for debugging
      console.log('Updating product with filter:', filter, 'ID:', id);
      
      let result = await col.findOneAndUpdate(filter, { $set: { ...updates, updated_at: new Date().toISOString() } }, { returnDocument: 'after' });
      
      // If not found by ID, try to find by name
      if (!result || !result.value) {
        console.log('Product not found by ID, trying by name');
        // Try exact name match first
        filter = { name: id };
        result = await col.findOneAndUpdate(filter, { $set: { ...updates, updated_at: new Date().toISOString() } }, { returnDocument: 'after' });
        
        // If still not found, try case-insensitive regex match
        if (!result || !result.value) {
          filter = { name: { $regex: new RegExp(`^${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } };
          result = await col.findOneAndUpdate(filter, { $set: { ...updates, updated_at: new Date().toISOString() } }, { returnDocument: 'after' });
        }
      }
      
      if (!result || !result.value) {
        console.log('❌ Backend - Product not found, creating new product with ID:', id);
        
        // Create new product with the provided ID
        const newProduct = {
          id: id,
          ...updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        try {
          const insertResult = await col.insertOne(newProduct);
          console.log('✅ Backend - Product created successfully:', { id, productName: newProduct.name });
          return res.json({ success: true, message: 'Product created successfully', product: newProduct });
        } catch (insertError) {
          console.error('❌ Backend - Failed to create product:', insertError);
          return res.status(500).json({ error: 'Failed to create product' });
        }
      }
      
      console.log('✅ Backend - Product updated successfully:', { id, productName: result.value.name });
      return res.json({ success: true, message: 'Product updated successfully', product: result.value });
    }

    // Fallback to in-memory store if database is not available
    // Try updating by ID first, then by name in memory store
    let updatedProduct = await store.update(id, updates);
    if (!updatedProduct) {
      // Try to find by name in memory store
      const products = await store.getAll();
      const productByName = products.find(p => p.name.toLowerCase() === id.toLowerCase());
      if (productByName) {
        updatedProduct = await store.update(productByName.id, updates);
      }
    }
    
    if (!updatedProduct) {
      console.log('❌ Backend - Product not found in memory store, creating new product with ID:', id);
      
      // Create new product in memory store
      const newProduct = {
        id: id,
        ...updates,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      try {
        updatedProduct = await store.add(newProduct);
        console.log('✅ Backend - Product created in memory store:', { id, productName: newProduct.name });
        return res.json({ success: true, message: 'Product created successfully', product: updatedProduct });
      } catch (createError) {
        console.error('❌ Backend - Failed to create product in memory store:', createError);
        return res.status(500).json({ error: 'Failed to create product' });
      }
    }

    res.json({ success: true, message: 'Product updated successfully', product: updatedProduct });

  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete all products
router.delete('/products/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const store = require('../store/productsStore');
    await store.init(); // Ensure store is initialized
    
    const col = await getProductsCollection();
    if (col) {
      // Delete all products from MongoDB collection
      await col.deleteMany({});
      return res.json({ success: true, message: 'All products deleted successfully' });
    }
    
    // Fallback to in-memory store if database is not available
    await store.deleteAll();
    res.json({ success: true, message: 'All products deleted successfully' });
  } catch (error) {
    console.error('Delete all products error:', error);
    res.status(500).json({ error: 'Failed to delete all products' });
  }
});

// Cleanup invalid products (empty names, 0 price, 0 stock)
router.delete('/products/cleanup', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const store = require('../store/productsStore');
    await store.init(); // Ensure store is initialized
    
    const col = await getProductsCollection();
    if (col) {
      // Find and delete invalid products from MongoDB collection
      const result = await col.deleteMany({
        $or: [
          { name: { $exists: false } },
          { name: null },
          { name: '' },
          { price: { $lte: 0 } },
          { stock_quantity: { $lte: 0 } }
        ]
      });
      
      return res.json({ 
        success: true, 
        message: `Cleaned up ${result.deletedCount} invalid products`,
        deletedCount: result.deletedCount
      });
    }
    
    // Fallback to in-memory store if database is not available
    const products = await store.getAll();
    const invalidProducts = products.filter(p => 
      !p.name || p.name.trim() === '' || p.price <= 0 || p.stock_quantity <= 0
    );
    
    let deletedCount = 0;
    for (const product of invalidProducts) {
      try {
        await store.delete(product.id);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete invalid product ${product.id}:`, error);
      }
    }
    
    res.json({ 
      success: true, 
      message: `Cleaned up ${deletedCount} invalid products`,
      deletedCount
    });
    
  } catch (error) {
    console.error('Cleanup invalid products error:', error);
    res.status(500).json({ error: 'Failed to cleanup invalid products' });
  }
});

// Delete product
router.delete('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const store = require('../store/productsStore');
    await store.init(); // Ensure store is initialized
    
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

    // Fallback to in-memory store if database is not available
    const removed = await store.remove(id);
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
    // Get image map from request body if available
    const imageMap = req.body.imageMap ? JSON.parse(req.body.imageMap) : {};

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

    const mapCamelToSnake = async (p, imageMap = {}) => {
      // Process image filenames to URLs if imageMap is provided
      let mainImage = p.image || '';
      // Handle both comma-separated string and array formats for allImages
      let imagesList = [];
      if (p.allImages) {
        if (typeof p.allImages === 'string') {
          imagesList = p.allImages.split(',').map(img => img.trim()).filter(img => img);
        } else if (Array.isArray(p.allImages)) {
          imagesList = p.allImages.filter(img => img);
        }
      }
      
      // If no images in the list but we have a main image, include it in the list
      if (imagesList.length === 0 && mainImage) {
        imagesList = [mainImage];
      }
      
      // If imageMap is provided, map filenames to URLs
      if (Object.keys(imageMap).length > 0) {
        // Map main image if it's a filename in the imageMap
        if (mainImage && imageMap[mainImage]) {
          mainImage = imageMap[mainImage];
        }
        
        // Map additional images if they're filenames in the imageMap
        imagesList = imagesList.map(img => imageMap[img] || img);
      } else {
        // If no imageMap, check for Google Drive URLs and convert to Cloudinary
        if (mainImage && (mainImage.includes('drive.google.com') || /^[a-zA-Z0-9-_]+$/.test(mainImage))) {
          try {
            console.log(`🔄 Converting Google Drive URL to Cloudinary: ${mainImage}`);
            const response = await fetch(`${process.env.API_URL || 'http://localhost:5000'}/api/cloudinary/upload-drive-url`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: mainImage })
            });
            
            if (response.ok) {
              const result = await response.json();
              if (result.success) {
                mainImage = result.cloudinaryUrl;
                console.log(`✅ Converted to Cloudinary: ${result.cloudinaryUrl}`);
              }
            }
          } catch (error) {
            console.error('Error converting main image to Cloudinary:', error);
            mainImage = convertGoogleDriveUrl(mainImage); // Fallback to direct URL
          }
        } else {
          mainImage = mainImage ? convertGoogleDriveUrl(mainImage) : mainImage;
        }
        
        // Process additional images
        imagesList = await Promise.all(imagesList.map(async (img) => {
          if (img && (img.includes('drive.google.com') || /^[a-zA-Z0-9-_]+$/.test(img))) {
            try {
              console.log(`🔄 Converting Google Drive URL to Cloudinary: ${img}`);
              const response = await fetch(`${process.env.API_URL || 'http://localhost:5000'}/api/cloudinary/upload-drive-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: img })
              });
              
              if (response.ok) {
                const result = await response.json();
                if (result.success) {
                  console.log(`✅ Converted to Cloudinary: ${result.cloudinaryUrl}`);
                  return result.cloudinaryUrl;
                }
              }
            } catch (error) {
              console.error('Error converting image to Cloudinary:', error);
            }
          }
          return convertGoogleDriveUrl(img); // Fallback to direct URL
        }));
      }
      
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: toNumber(p.price),
        original_price: toNumber(p.originalPrice),
        discount: toNumber(p.discount),
        is_on_sale: toBoolean(p.isOnSale),
        is_new: toBoolean(p.isNew),
        image: mainImage,
        images: imagesList,
        description: p.description || '',
        in_stock: typeof p.inStock === 'boolean' ? p.inStock : undefined,
        powerPoints: toNumber(p.powerPoints) || 50,
        stock_quantity: toNumber(p.stockQuantity)
      };
    };

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
      // Convert to camelCase schema supporting both old and new CSV formats
      const product = {
        id: obj.id || obj.ID || '',
        name: obj.name || obj.Name || obj['Product Name'] || '',
        category: obj.category || obj.Category || '',
        price: obj.price ?? obj.Price ?? 0,
        originalPrice: obj.originalPrice ?? obj.original_price ?? obj.OriginalPrice,
        discount: obj.discount ?? obj.Discount ?? 0,
        isOnSale: obj.isOnSale ?? obj.is_on_sale ?? obj.IsOnSale ?? false,
        isNew: obj.isNew ?? obj.is_new ?? obj.IsNew ?? true,
        image: obj.image ?? obj.Image ?? '',
        description: obj.description ?? obj.Description ?? `High quality ${obj.name || obj.Name || obj['Product Name'] || 'product'}`,
        inStock: obj.inStock ?? obj.in_stock ?? obj.InStock ?? true,
        powerPoints: obj.powerPoints ?? obj.power_points ?? obj.PowerPoints ?? 50,
        stockQuantity: obj.stockQuantity ?? obj.stock_quantity ?? obj.StockQuantity ?? obj.Stock ?? obj.stock ?? 0
      };
      return product;
    });

    // Validate minimal required fields
    const errors = [];
    const valid = [];
    for (let idx = 0; idx < normalized.length; idx++) {
      const p = normalized[idx];
      if (!p.name || !p.category || (p.price === undefined || p.price === '')) {
        errors.push({ row: idx + 2, error: 'Missing required fields: name, category, price' });
        continue;
      }
      const mapped = await mapCamelToSnake(p, imageMap);
      // Derive in_stock from stock_quantity if not provided
      if (typeof mapped.in_stock !== 'boolean' && typeof mapped.stock_quantity === 'number') {
        mapped.in_stock = mapped.stock_quantity > 0;
      }
      valid.push(mapped);
    }

    // Apply to MongoDB if available, otherwise in-memory store
    const col = await getProductsCollection();
    let created = 0, updated = 0;
    if (col) {
      for (const p of valid) {
        const id = p.id && String(p.id).trim().length ? String(p.id) : null;
        const name = p.name && String(p.name).trim();
        
        if (mode === 'add') {
          if (!id) {
            const doc = require('../store/productsStore').add(p);
            await col.insertOne({ ...doc });
            created++;
          }
        } else if (mode === 'update') {
          // Try to find by ID or name for update
          if (id) {
            const r = await col.updateOne({ id }, { $set: { ...p, updated_at: new Date().toISOString() } });
            if (r.matchedCount) updated++;
          } else if (name) {
            // If no ID but name exists, try to update by name
            const r = await col.updateOne({ name }, { $set: { ...p, updated_at: new Date().toISOString() } });
            if (r.matchedCount) updated++;
            else {
              // If no match by name, create new
              const doc = require('../store/productsStore').add(p);
              await col.insertOne({ ...doc });
              created++;
            }
          }
        } else {
          // upsert - try by ID first, then by name
          if (id) {
            const doc = { ...p, updated_at: new Date().toISOString() };
            await col.updateOne({ id }, { $set: doc }, { upsert: true });
            updated++;
          } else if (name) {
            // Check if product with this name already exists
            const existing = await col.findOne({ name });
            if (existing) {
              // Update existing product by name
              await col.updateOne({ name }, { $set: { ...p, updated_at: new Date().toISOString() } });
              updated++;
            } else {
              // Create new product
              const doc = require('../store/productsStore').add(p);
              await col.insertOne({ ...doc });
              created++;
            }
          } else {
            // No ID or name, just create new
            const doc = require('../store/productsStore').add(p);
            await col.insertOne({ ...doc });
            created++;
          }
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
router.get('/customers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    if (!usersCollection) {
      return res.status(500).json({ error: 'Users collection not available' });
    }
    
    const customers = await usersCollection.find({ role: 'customer' }).toArray();

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
