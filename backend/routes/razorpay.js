const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

// Load environment variables
require('dotenv').config();

// Initialize Razorpay with live keys from environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_RD4Ia7eTGct90w',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'B18FWmc6yNaaVSQkPDULsJ2U'
});

console.log('🔑 Razorpay Configuration:');
console.log('  Key ID:', process.env.RAZORPAY_KEY_ID ? '✅ Configured' : '⚠️ Using fallback');
console.log('  Key Secret:', process.env.RAZORPAY_KEY_SECRET ? '✅ Configured' : '⚠️ Using fallback');
console.log('  Mode: LIVE PRODUCTION');
console.log('  API Version: Latest Orders API');

// Create Razorpay order using latest orders API
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = 'order_receipt' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    console.log('🛒 Creating Razorpay order:', {
      amount_in_rupees: amount,
      amount_in_paise: Math.round(amount * 100),
      currency,
      receipt
    });

    // Create order with modern parameters
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt,
      payment_capture: 1,
      notes: {
        integration: 'latest_orders_api',
        mode: 'live_production',
        source: 'figure_it_out_store'
      },
      // Add these modern parameters for better compatibility
      partial_payment: false,
      first_payment_min_amount: Math.round(amount * 100)
    };

    const order = await razorpay.orders.create(options);
    
    console.log('✅ Razorpay order created successfully:', {
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      receipt: order.receipt
    });
    
    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });

  } catch (error) {
    console.error('❌ Razorpay order creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create payment order',
      details: error.message 
    });
  }
});

// Verify payment signature
router.post('/verify-payment', async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      method 
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('❌ Missing payment details:', req.body);
      return res.status(400).json({ error: 'Missing payment details' });
    }

    console.log('🔍 Verifying payment signature:', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature_length: razorpay_signature.length,
      method: method || 'razorpay'
    });

    // Standard Razorpay signature verification
    // Create the signature string
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    // Generate expected signature using key from environment variable
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'B18FWmc6yNaaVSQkPDULsJ2U';
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    console.log('🔐 Razorpay signature verification details:', {
      body_string: body,
      key_secret: keySecret.substring(0, 10) + '...',
      key_secret_length: keySecret.length,
      expected_signature: expectedSignature.substring(0, 20) + '...',
      received_signature: razorpay_signature.substring(0, 20) + '...'
    });

    // Verify signature
    const isAuthentic = expectedSignature === razorpay_signature;

    console.log('✅ Payment verification result:', {
      isAuthentic,
      signature_match: isAuthentic ? '✅ MATCH' : '❌ MISMATCH',
      method: method || 'razorpay'
    });

    if (isAuthentic) {
      res.json({
        success: true,
        verified: true,
        message: 'Payment verified successfully',
        method: method || 'razorpay'
      });
    } else {
      console.error('❌ Invalid payment signature');
      res.status(400).json({
        success: false,
        verified: false,
        error: 'Invalid payment signature',
        method: method || 'razorpay'
      });
    }

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({ 
      error: 'Payment verification failed',
      details: error.message 
    });
  }
});

// Get payment details
router.get('/payment/:payment_id', async (req, res) => {
  try {
    const { payment_id } = req.params;
    
    const payment = await razorpay.payments.fetch(payment_id);
    
    res.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        created_at: payment.created_at
      }
    });

  } catch (error) {
    console.error('Payment fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payment details',
      details: error.message 
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Razorpay integration is healthy',
    mode: 'LIVE PRODUCTION',
    api_version: 'Modern Orders API',
    key_id: process.env.RAZORPAY_KEY_ID ? 'configured' : 'using_fallback'
  });
});

module.exports = router;
