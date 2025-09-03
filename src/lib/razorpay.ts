// Razorpay configuration for LIVE PRODUCTION
export const RAZORPAY_CONFIG = {
  key_id: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_RD4Ia7eTGct90w',
  key_secret: import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'B18FWmc6yNaaVSQkPDULsJ2U',
  currency: 'INR',
  mode: 'live'
};

// Get the correct API URL based on environment
const getApiUrl = () => {
  // Check if we're in production
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Production environment - use production API
    return 'https://api.figureitoutstore.in/api';
  }
  // Development environment - use local API
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

// Load Razorpay script
export const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if Razorpay is already loaded
    if ((window as any).Razorpay) {
      console.log('✅ Razorpay already loaded');
      resolve();
      return;
    }

    console.log('📦 Loading Razorpay script...');

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ Razorpay script loaded successfully');
      resolve();
    };
    
    script.onerror = (error) => {
      console.error('❌ Failed to load Razorpay script:', error);
      reject(new Error('Failed to load Razorpay script'));
    };
    
    document.body.appendChild(script);
  });
};

// Create Razorpay order
export const createRazorpayOrder = async (amount: number, currency: string = 'INR') => {
  try {
    console.log('🛒 Creating Razorpay order:', { amount, currency });
    
    const apiUrl = getApiUrl();
    console.log('🌐 Using API URL:', apiUrl);
    
    const response = await fetch(`${apiUrl}/razorpay/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,   // in rupees
        currency,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Order creation failed:', errorText);
      throw new Error(`Failed to create order: ${errorText}`);
    }

    const order = await response.json();
    console.log('✅ Razorpay order created:', order);
    return order;
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    throw error;
  }
};

// Initialize Razorpay payment using their default UI
export const initializePayment = async (
  orderId: string,
  currency: string = 'INR',
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  onSuccess: (response: any) => void,
  onFailure: (error: any) => void
) => {
  // Store original fetch function
  const originalFetch = window.fetch;
  
  try {
    console.log('🚀 Initializing Razorpay payment with default UI...');
    console.log('🔍 Order ID from backend:', orderId);
    
    // Intercept and block v2 API calls before loading Razorpay
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && url.includes('/v2/standard_checkout/preferences')) {
        console.log('🚫 Blocking v2 preferences API call:', url);
        // Return a mock successful response to prevent the error
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, v1_mode: true })
        } as Response);
      }
      return originalFetch.apply(this, args);
    };
    
    await loadRazorpayScript();

    // Validate inputs
    if (!orderId || !customerName || !customerEmail) {
      throw new Error('Missing required payment parameters');
    }

    // Create Razorpay options using backend order_id
    const options = {
      key: RAZORPAY_CONFIG.key_id,
      currency: currency || 'INR',
      name: 'FIGURE IT OUT',
      description: 'Anime Collectibles Purchase',
      order_id: orderId, // This contains the amount from backend order
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      },
      theme: {
        color: '#dc2626',
      },
      handler: (response: any) => {
        console.log('✅ Payment completed successfully:', response);
        onSuccess(response);
      },
      modal: {
        ondismiss: () => {
          console.log('⚠️ Payment modal dismissed');
          onFailure(new Error('Payment cancelled'));
        },
        escape: false,
        backdropclose: false
      },
      // Force v1 mode and disable v2 features
      v2: false,
      checkout: {
        method: {
          upi: "force",
          card: "force",
          netbanking: "force"
        }
      },
      // Ensure proper callback handling
      callback_url: window.location.origin + '/orders',
      cancel_url: window.location.origin + '/checkout'
    };

    console.log('🔧 Razorpay payment options:', {
      key: options.key,
      currency: options.currency,
      order_id: options.order_id,
      mode: 'LIVE PRODUCTION'
    });

    // Create Razorpay instance
    if (!(window as any).Razorpay) {
      throw new Error('Razorpay script not loaded properly');
    }

    const razorpay = new (window as any).Razorpay(options);
    
    console.log('✅ Razorpay instance created successfully');
    console.log('🚀 Opening payment modal...');
    
    // Open the payment modal
    razorpay.open();
    
    // Restore original fetch function after modal opens
    setTimeout(() => {
      window.fetch = originalFetch;
      console.log('✅ Restored original fetch function');
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error initializing payment:', error);
    // Restore original fetch function on error
    window.fetch = originalFetch;
    onFailure(error);
  }
};

// Verify payment signature
export const verifyPaymentSignature = async (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) => {
  try {
    console.log('🔍 Verifying payment signature...');
    console.log('📋 Payment details:', { order_id: razorpay_order_id, payment_id: razorpay_payment_id });
    
    const apiUrl = getApiUrl();
    console.log('🌐 Using API URL for verification:', apiUrl);
    
    const response = await fetch(`${apiUrl}/razorpay/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        method: 'razorpay'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Payment verification failed:', errorText);
      throw new Error(`Payment verification failed: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Payment verification result:', result);
    return result;
  } catch (error) {
    console.error('❌ Error verifying payment signature:', error);
    throw error;
  }
};

// Payment status types
export type PaymentStatus = 'pending' | 'completed' | 'failed';

// Payment response interface
export interface PaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
