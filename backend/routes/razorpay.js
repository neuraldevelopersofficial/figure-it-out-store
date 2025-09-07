const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_RD4Ia7eTGct90w',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'B18FWmc6yNaaVSQkPDULsJ2U'
});

// Create order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      payment_capture: 1,
    });
    
    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    console.log('🔍 Payment verification request:', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature ? 'present' : 'missing'
    });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.log('❌ Missing payment details:', {
        has_order_id: !!razorpay_order_id,
        has_payment_id: !!razorpay_payment_id,
        has_signature: !!razorpay_signature
      });
      return res.status(400).json({ error: 'Missing payment details' });
    }

    // Create signature string
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'B18FWmc6yNaaVSQkPDULsJ2U')
      .update(body)
      .digest('hex');

    console.log('🔍 Signature verification:', {
      body,
      expectedSignature,
      receivedSignature: razorpay_signature,
      isAuthentic: expectedSignature === razorpay_signature
    });

    // Verify signature
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      console.log('✅ Payment verification successful');
      res.json({
        success: true,
        verified: true,
        message: 'Payment verified successfully'
      });
    } else {
      console.log('❌ Payment verification failed - invalid signature');
      res.status(400).json({
        success: false,
        verified: false,
        error: 'Invalid payment signature'
      });
    }

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

module.exports = router;