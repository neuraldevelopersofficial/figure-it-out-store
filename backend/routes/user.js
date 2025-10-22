const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const userStore = require('../store/userStore');
const ordersStore = require('../store/ordersStore');
const { getDatabase, getCollection, COLLECTIONS } = require('../config/database');

async function getUsersCollection() {
  try {
    const db = await getDatabase();
    if (!db) return null;
    return await getCollection(COLLECTIONS.USERS);
  } catch (e) {
    return null;
  }
}

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const col = await getUsersCollection();
    const user = col ? await col.findOne({ id: req.user.id }) : userStore.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password, ...userProfile } = user;
    res.json({ success: true, user: userProfile });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const col = await getUsersCollection();
    if (col) {
      const result = await col.findOneAndUpdate(
        { id: req.user.id },
        { $set: { name, phone, email, updated_at: new Date().toISOString() } },
        { returnDocument: 'after' }
      );
      if (!result.value) return res.status(404).json({ error: 'User not found' });
      const { password, ...userProfile } = result.value;
      return res.json({ success: true, message: 'Profile updated successfully', user: userProfile });
    }
    const updatedUser = userStore.updateUser(req.user.id, { name, phone, email });
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    const { password, ...userProfile } = updatedUser;
    res.json({ success: true, message: 'Profile updated successfully', user: userProfile });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user orders
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    // Use the same logic as the orders route
    const { getCollection, COLLECTIONS } = require('../config/database');
    
    async function getOrdersCollection() {
      try {
        const db = await require('../config/database').getDatabase();
        if (!db) return null;
        return await getCollection(COLLECTIONS.ORDERS);
      } catch (e) {
        return null;
      }
    }
    
    const col = await getOrdersCollection();
    if (!col) {
      const orders = ordersStore.getOrdersByUserId(req.user.id);
      return res.json({
        success: true,
        orders: orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      });
    }
    
    // Try to find orders with better error handling
    let userOrders = [];
    try {
      userOrders = await col.find({ 
        $or: [
          { user_id: req.user.id },
          { userId: req.user.id }
        ]
      }).sort({ created_at: -1 }).toArray();
    } catch (dbError) {
      console.error('Database query error');
      // Fallback to in-memory orders
      userOrders = ordersStore.getOrdersByUserId(req.user.id);
    }
    
    res.json({
      success: true,
      orders: userOrders
    });
  } catch (error) {
    console.error('Orders fetch error');
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get specific order details
router.get('/orders/:orderId', authenticateToken, (req, res) => {
  try {
    const { orderId } = req.params;
    const order = ordersStore.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify order belongs to user
    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get reviews for this order
    const reviews = ordersStore.getReviewsByOrderId(orderId);
    
    res.json({
      success: true,
      order,
      reviews
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get order invoice
router.get('/orders/:orderId/invoice', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Use the same logic as the orders route
    const { getCollection, COLLECTIONS } = require('../config/database');
    
    async function getOrdersCollection() {
      try {
        const db = await require('../config/database').getDatabase();
        if (!db) return null;
        return await getCollection(COLLECTIONS.ORDERS);
      } catch (e) {
        return null;
      }
    }
    
    const col = await getOrdersCollection();
    let order = null;
    
    if (col) {
      order = await col.findOne({ 
        id: orderId, 
        $or: [
          { user_id: req.user.id },
          { userId: req.user.id }
        ]
      });
    } else {
      // Fallback to in-memory storage
      order = ordersStore.getOrderById(orderId);
      if (order && order.userId !== req.user.id) {
        order = null; // Access denied
      }
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Generate invoice data
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 2000 ? 0 : 99; // Free shipping above ₹2000
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const calculatedTotal = subtotal + shipping + tax;
    
    // Use the order's total_amount if it exists, otherwise use calculated total
    const total = order.total_amount || order.totalAmount || calculatedTotal;

    const invoice = {
      orderId: order.id,
      orderNumber: order.orderNumber || order.id,
      date: order.created_at,
      customer: {
        name: order.shipping_address || order.shippingAddress?.name || 'Customer',
        address: {
          address: order.shipping_address || order.shippingAddress?.addressLine1 || '',
          city: order.shipping_city || order.shippingAddress?.city || '',
          state: order.shipping_state || order.shippingAddress?.state || '',
          pincode: order.shipping_pincode || order.shippingAddress?.pincode || '',
          phone: order.shipping_phone || order.shippingAddress?.phone || ''
        }
      },
      items: order.items.map(item => ({
        ...item,
        total: item.price * item.quantity
      })),
      summary: {
        subtotal,
        shipping,
        tax,
        total
      },
      paymentMethod: order.payment_method || order.paymentMethod,
      paymentStatus: order.payment_status || order.paymentStatus,
      status: order.status
    };
    
    res.json({
      success: true,
      invoice
    });
  } catch (error) {
    console.error('Invoice generation error');
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
});

// Add product review
router.post('/orders/:orderId/review', authenticateToken, (req, res) => {
  try {
    const { orderId } = req.params;
    const { productId, rating, comment } = req.body;
    
    if (!productId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid product ID and rating (1-5) are required' });
    }

    const order = ordersStore.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify order belongs to user and is delivered
    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'Can only review delivered orders' });
    }

    // Check if product is in the order
    const orderItem = order.items.find(item => item.productId === productId);
    if (!orderItem) {
      return res.status(400).json({ error: 'Product not found in this order' });
    }

    // Check if review already exists
    const existingReview = ordersStore.getReviewByProductAndUser(productId, req.user.id);
    if (existingReview) {
      return res.status(400).json({ error: 'Review already exists for this product' });
    }

    const review = ordersStore.createReview({
      orderId,
      productId,
      userId: req.user.id,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// Update product review
router.put('/reviews/:reviewId', authenticateToken, (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid rating (1-5) is required' });
    }

    const updatedReview = ordersStore.updateReview(reviewId, {
      rating,
      comment
    });

    if (!updatedReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Review update error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Address management
router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    const col = await getUsersCollection();
    const user = col ? await col.findOne({ id: req.user.id }, { projection: { addresses: 1 } }) : userStore.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, addresses: user.addresses || [] });
  } catch (error) {
    console.error('Addresses fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

router.post('/addresses', authenticateToken, async (req, res) => {
  try {
    const addressData = req.body;
    
    // Validate required fields
    const missingFields = [];
    if (!addressData.name) missingFields.push('name');
    if (!addressData.address) missingFields.push('address');
    if (!addressData.city) missingFields.push('city');
    if (!addressData.pincode) missingFields.push('pincode');
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Map 'address' field to 'addressLine1' for consistent storage
    const mappedAddressData = {
      ...addressData,
      addressLine1: addressData.address,
      addressLine2: addressData.address_line2 || addressData.addressLine2 || ''
    };
    delete mappedAddressData.address;
    delete mappedAddressData.address_line2;
    
    const col = await getUsersCollection();
    const newAddress = { 
      id: require('uuid').v4(), 
      ...mappedAddressData, 
      created_at: new Date().toISOString() 
    };
    
    if (col) {
      // Ensure user has an addresses array
      const user = await col.findOne({ id: req.user.id });
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      // Initialize addresses array if it doesn't exist
      if (!user.addresses) {
        await col.updateOne({ id: req.user.id }, { $set: { addresses: [] } });
      }
      
      const r = await col.updateOne(
        { id: req.user.id }, 
        { $push: { addresses: newAddress }, $set: { updated_at: new Date().toISOString() } }
      );
      
      if (!r.matchedCount) return res.status(404).json({ error: 'User not found' });
    } else {
      const a = userStore.addAddress(req.user.id, mappedAddressData);
      if (!a) return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(201).json({ success: true, message: 'Address added successfully', address: newAddress });
  } catch (error) {
    console.error('Address creation error');
    res.status(500).json({ 
      error: 'Failed to add address'
    });
  }
});

router.put('/addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const { addressId } = req.params;
    const updates = req.body;
    
    // Map 'address' field to 'addressLine1' for consistent storage
    const mappedUpdates = { ...updates };
    if (updates.address) {
      mappedUpdates.addressLine1 = updates.address;
      delete mappedUpdates.address;
    }
    if (updates.address_line2) {
      mappedUpdates.addressLine2 = updates.address_line2;
      delete mappedUpdates.address_line2;
    }
    
    const col = await getUsersCollection();
    if (col) {
      // First check if the user and address exist
      const user = await col.findOne({ id: req.user.id });
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      const addressExists = user.addresses && user.addresses.some(a => a.id === addressId);
      if (!addressExists) return res.status(404).json({ error: 'Address not found' });
      
      // Preserve the address ID and created_at when updating
      const existingAddress = user.addresses.find(a => a.id === addressId);
      const updatedAddress = {
        ...existingAddress,
        ...mappedUpdates,
        id: addressId // Ensure ID is preserved
      };
      
      const r = await col.findOneAndUpdate(
        { id: req.user.id, 'addresses.id': addressId },
        { $set: { 'addresses.$': updatedAddress, updated_at: new Date().toISOString() } },
        { returnDocument: 'after' }
      );
      
      if (!r.value) return res.status(404).json({ error: 'Address not found' });
      const updated = (r.value.addresses || []).find(a => a.id === addressId);
      return res.json({ success: true, message: 'Address updated successfully', address: updated });
    }
    const updatedAddress = userStore.updateAddress(req.user.id, addressId, mappedUpdates);
    if (!updatedAddress) return res.status(404).json({ error: 'Address not found' });
    res.json({ success: true, message: 'Address updated successfully', address: updatedAddress });
  } catch (error) {
    console.error('Address update error:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

router.delete('/addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const { addressId } = req.params;
    const col = await getUsersCollection();
    if (col) {
      const r = await col.updateOne({ id: req.user.id }, { $pull: { addresses: { id: addressId } }, $set: { updated_at: new Date().toISOString() } });
      if (!r.matchedCount) return res.status(404).json({ error: 'Address not found' });
      return res.json({ success: true, message: 'Address deleted successfully' });
    }
    const deleted = userStore.deleteAddress(req.user.id, addressId);
    if (!deleted) return res.status(404).json({ error: 'Address not found' });
    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Address deletion error:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

// Wishlist management
router.get('/wishlist', authenticateToken, async (req, res) => {
  try {
    const col = await getUsersCollection();
    if (col) {
      const user = await col.findOne({ id: req.user.id }, { projection: { wishlist: 1 } });
      return res.json({ success: true, wishlist: (user && user.wishlist) || [] });
    }
    const wishlist = userStore.getWishlist(req.user.id);
    res.json({ success: true, wishlist });
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

router.post('/wishlist', authenticateToken, async (req, res) => {
  try {
    const productData = req.body;
    if (!productData.productId || !productData.name || !productData.price) {
      return res.status(400).json({ error: 'Product ID, name, and price are required' });
    }
    const item = { id: require('uuid').v4(), ...productData, created_at: new Date().toISOString() };
    const col = await getUsersCollection();
    if (col) {
      const r = await col.updateOne({ id: req.user.id }, { $push: { wishlist: item }, $set: { updated_at: new Date().toISOString() } });
      if (!r.matchedCount) return res.status(404).json({ error: 'User not found' });
      return res.status(201).json({ success: true, message: 'Product added to wishlist', item });
    }
    const wishlistItem = userStore.addToWishlist(req.user.id, productData);
    if (!wishlistItem) return res.status(404).json({ error: 'User not found' });
    res.status(201).json({ success: true, message: 'Product added to wishlist', item: wishlistItem });
  } catch (error) {
    console.error('Wishlist addition error:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

router.delete('/wishlist/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const col = await getUsersCollection();
    if (col) {
      const r = await col.updateOne({ id: req.user.id }, { $pull: { wishlist: { productId } }, $set: { updated_at: new Date().toISOString() } });
      if (!r.matchedCount) return res.status(404).json({ error: 'Product not found in wishlist' });
      return res.json({ success: true, message: 'Product removed from wishlist' });
    }
    const removed = userStore.removeFromWishlist(req.user.id, productId);
    if (!removed) return res.status(404).json({ error: 'Product not found in wishlist' });
    res.json({ success: true, message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('Wishlist removal error:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// Update preferences
router.put('/preferences', authenticateToken, (req, res) => {
  try {
    const preferences = req.body;
    
    const updatedPreferences = userStore.updatePreferences(req.user.id, preferences);
    
    if (!updatedPreferences) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: updatedPreferences
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

module.exports = router;
