const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { getDatabase, getCollection, COLLECTIONS } = require('../config/database');

// Middleware to verify JWT token
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

// In-memory storage for orders (replace with database in production)
let orders = [];

async function getOrdersCollection() {
  try {
    const db = await getDatabase();
    if (!db) return null;
    return await getCollection(COLLECTIONS.ORDERS);
  } catch (e) {
    return null;
  }
}

// Create new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, total_amount, shipping_address, shipping_city, shipping_state, shipping_pincode, shipping_phone, payment_method } = req.body;

    if (!items || !total_amount || !shipping_address || !shipping_city || !shipping_state || !shipping_pincode) {
      return res.status(400).json({ error: 'Missing required order details' });
    }
    
    // Validate COD payment method (only available for orders above ₹1000)
    if (payment_method === 'cod' && total_amount < 1000) {
      return res.status(400).json({ error: 'Cash on Delivery is only available for orders above ₹1000' });
    }

    const newOrder = {
      id: uuidv4(),
      user_id: req.user.id,
      userId: req.user.id, // Add both for compatibility
      items: items,
      total_amount: total_amount,
      totalAmount: total_amount, // Add both for compatibility
      shipping_address: shipping_address,
      shipping_city: shipping_city,
      shipping_state: shipping_state,
      shipping_pincode: shipping_pincode,
      shipping_phone: shipping_phone || '',
      payment_method: payment_method || 'razorpay',
      status: payment_method === 'cod' ? 'processing' : 'pending',
      payment_status: payment_method === 'cod' ? 'pending' : 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Creating new order:', {
      order_id: newOrder.id,
      user_id: newOrder.user_id,
      total_amount: newOrder.total_amount,
      payment_method: newOrder.payment_method
    });

    const col = await getOrdersCollection();
    if (col) {
      await col.insertOne({ ...newOrder });
      console.log('✅ Order created in database:', newOrder.id);
      return res.status(201).json({ success: true, message: 'Order created successfully', order: newOrder });
    }

    // Fallback to in-memory storage
    orders.push(newOrder);
    console.log('✅ Order created in memory:', newOrder.id);
    res.status(201).json({ success: true, message: 'Order created successfully', order: newOrder });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching orders for user:', { user_id: req.user.id });
    
    const col = await getOrdersCollection();
    const userOrders = col ? 
      await col.find({ 
        $or: [
          { user_id: req.user.id },
          { userId: req.user.id }
        ]
      }).sort({ created_at: -1 }).toArray() : 
      orders.filter(o => 
        o.user_id === req.user.id || o.userId === req.user.id
      ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    console.log('✅ Found orders for user:', { user_id: req.user.id, count: userOrders.length });
    
    res.json({
      success: true,
      orders: userOrders
    });

  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Fetching order by ID:', { order_id: id, user_id: req.user.id });
    
    const col = await getOrdersCollection();
    const order = col ? 
      await col.findOne({ 
        id, 
        $or: [
          { user_id: req.user.id },
          { userId: req.user.id }
        ]
      }) : 
      orders.find(o => 
        o.id === id && (o.user_id === req.user.id || o.userId === req.user.id)
      );
    
    if (!order) {
      console.log('❌ Order not found:', { order_id: id, user_id: req.user.id });
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log('✅ Order found:', { order_id: id, status: order.status });
    res.json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    console.log('Updating order status:', { order_id: id, new_status: status, user_id: req.user.id });

    const col = await getOrdersCollection();
    if (col) {
      // Try to find order by ID and either user_id or userId field
      const result = await col.findOneAndUpdate(
        { 
          id: id, 
          $or: [
            { user_id: req.user.id },
            { userId: req.user.id }
          ]
        },
        { $set: { status, updated_at: new Date().toISOString() } },
        { returnDocument: 'after' }
      );
      
      if (!result.value) {
        console.log('❌ Order not found in database:', { order_id: id, user_id: req.user.id });
        return res.status(404).json({ error: 'Order not found' });
      }
      
      console.log('✅ Order status updated in database:', { order_id: id, new_status: status });
      return res.json({ success: true, message: 'Order status updated successfully', order: result.value });
    }
    
    // Fallback to in-memory storage
    const orderIndex = orders.findIndex(o => 
      o.id === id && (o.user_id === req.user.id || o.userId === req.user.id)
    );
    
    if (orderIndex === -1) {
      console.log('❌ Order not found in memory:', { order_id: id, user_id: req.user.id });
      return res.status(404).json({ error: 'Order not found' });
    }
    
    orders[orderIndex].status = status;
    orders[orderIndex].updated_at = new Date().toISOString();
    
    console.log('✅ Order status updated in memory:', { order_id: id, new_status: status });
    res.json({ success: true, message: 'Order status updated successfully', order: orders[orderIndex] });

  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Confirm payment for order
router.post('/:id/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Payment details required' });
    }

    console.log('Confirming payment for order:', { order_id: id, user_id: req.user.id });

    const col = await getOrdersCollection();
    if (col) {
      const result = await col.findOneAndUpdate(
        { 
          id, 
          $or: [
            { user_id: req.user.id },
            { userId: req.user.id }
          ]
        },
        { $set: {
          payment_status: 'completed',
          razorpay_payment_id,
          razorpay_signature,
          updated_at: new Date().toISOString()
        } },
        { returnDocument: 'after' }
      );
      
      if (!result.value) {
        console.log('❌ Order not found in database for payment confirmation:', { order_id: id, user_id: req.user.id });
        return res.status(404).json({ error: 'Order not found' });
      }
      
      console.log('✅ Payment confirmed in database:', { order_id: id, payment_id: razorpay_payment_id });
      return res.json({ success: true, message: 'Payment confirmed successfully', order: result.value });
    }
    
    // Fallback to in-memory storage
    const orderIndex = orders.findIndex(o => 
      o.id === id && (o.user_id === req.user.id || o.userId === req.user.id)
    );
    
    if (orderIndex === -1) {
      console.log('❌ Order not found in memory for payment confirmation:', { order_id: id, user_id: req.user.id });
      return res.status(404).json({ error: 'Order not found' });
    }
    
    orders[orderIndex].payment_status = 'completed';
    orders[orderIndex].razorpay_payment_id = razorpay_payment_id;
    orders[orderIndex].razorpay_signature = razorpay_signature;
    orders[orderIndex].updated_at = new Date().toISOString();
    
    console.log('✅ Payment confirmed in memory:', { order_id: id, payment_id: razorpay_payment_id });
    res.json({ success: true, message: 'Payment confirmed successfully', order: orders[orderIndex] });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

module.exports = router;
