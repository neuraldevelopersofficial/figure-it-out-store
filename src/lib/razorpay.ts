// Razorpay configuration for LIVE PRODUCTION
export const RAZORPAY_CONFIG = {
  key_id: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_RD4Ia7eTGct90w',
  key_secret: import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'B18FWmc6yNaaVSQkPDULsJ2U',
  currency: 'INR',
  mode: 'live' // Force live production mode
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

// Log configuration for debugging
console.log('🔥 Razorpay Config Loaded:', {
  key_id: RAZORPAY_CONFIG.key_id,
  mode: RAZORPAY_CONFIG.mode,
  isLive: RAZORPAY_CONFIG.mode === 'live',
  apiUrl: getApiUrl(),
  hostname: window.location.hostname,
  timestamp: new Date().toISOString()
});

// Clear existing Razorpay instances and scripts
const clearExistingRazorpay = () => {
  console.log('🧹 Clearing existing Razorpay instances...');
  
  // Clear global Razorpay variable
  if ((window as any).__razorpay) {
    console.log('❌ Clearing existing razorpay variable');
    delete (window as any).__razorpay;
  }
  
  // Clear any existing Razorpay instances
  if ((window as any).razorpay) {
    console.log('❌ Clearing existing razorpay instance');
    delete (window as any).razorpay;
  }
  
  // Remove existing Razorpay scripts
  const existingScripts = document.querySelectorAll('script[src*="checkout.razorpay.com"]');
  existingScripts.forEach(script => {
    console.log('🗑️ Removing existing Razorpay script');
    script.remove();
  });
};

// Load fresh Razorpay script with latest version
export const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Clear any existing Razorpay instances and scripts
    clearExistingRazorpay();

    console.log('📦 Loading fresh Razorpay script...');

    const script = document.createElement('script');
    // Use the latest version without explicit versioning to get the most recent
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.defer = true;
    
    // Add error handling for script loading
    let scriptLoadTimeout: NodeJS.Timeout;
    
    script.onload = () => {
      clearTimeout(scriptLoadTimeout);
      console.log('✅ Razorpay script loaded successfully - LIVE PRODUCTION MODE');
      console.log('📊 Razorpay version:', (window as any).Razorpay?.version || 'unknown');
      console.log('🔧 Razorpay instance type:', typeof (window as any).Razorpay);
      
      // Verify the script loaded correctly
      if (!(window as any).Razorpay) {
        reject(new Error('Razorpay script loaded but Razorpay object not found'));
        return;
      }
      
      // Additional verification - check if Razorpay constructor is callable
      try {
        const testInstance = new (window as any).Razorpay({});
        console.log('✅ Razorpay constructor test passed');
        resolve();
      } catch (error) {
        console.error('❌ Razorpay constructor test failed:', error);
        reject(new Error('Razorpay constructor is not working properly'));
      }
    };
    
    script.onerror = (error) => {
      clearTimeout(scriptLoadTimeout);
      console.error('❌ Failed to load Razorpay script:', error);
      reject(new Error('Failed to load Razorpay script'));
    };
    
    // Add timeout for script loading
    scriptLoadTimeout = setTimeout(() => {
      console.error('❌ Razorpay script loading timeout');
      reject(new Error('Razorpay script loading timeout'));
    }, 10000); // 10 second timeout
    
    document.body.appendChild(script);
  });
};

// Create Razorpay order
// ✅ Send amount in rupees, backend will convert to paise
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
    return order; // contains { order_id, amount, currency }
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    throw error;
  }
};

// Initialize Razorpay payment using latest orders API
// ✅ Use amount + order_id returned from backend directly
export const initializePayment = async (
  orderId: string,
  amount: number, // this should already be in paise (from backend order)
  currency: string = 'INR',
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  onSuccess: (response: any) => void,
  onFailure: (error: any) => void
) => {
  try {
    console.log('🚀 Initializing Razorpay payment...');
    
    await loadRazorpayScript();

    // Validate inputs
    if (!orderId || !amount || !customerName || !customerEmail) {
      throw new Error('Missing required payment parameters');
    }

    // Create modern options object with only essential parameters
    // Avoid deprecated parameters and use the latest API structure
    const options = {
      key: RAZORPAY_CONFIG.key_id,
      amount: Number(amount),
      currency: currency || 'INR',
      name: 'FIGURE IT OUT',
      description: 'Anime Collectibles Purchase',
      order_id: orderId,
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
      },
      // Add these parameters to ensure compatibility with latest API
      notes: {
        source: 'figure_it_out_store',
        integration: 'latest_api'
      },
      // Ensure proper error handling
      retry: {
        enabled: true,
        max_count: 3
      }
    };

    console.log('🔧 Razorpay payment options:', {
      key: options.key,
      amount: options.amount,
      currency: options.currency,
      order_id: options.order_id,
      mode: 'LIVE PRODUCTION',
      api_version: 'latest'
    });

    // Ensure we're using the modern Razorpay instance
    if (!(window as any).Razorpay) {
      throw new Error('Razorpay script not loaded properly');
    }

    // Log the constructor and options
    console.log('🔨 Creating Razorpay instance...');
    console.log('🔧 Razorpay constructor available:', !!(window as any).Razorpay);
    
    // Create Razorpay instance with modern options
    const razorpay = new (window as any).Razorpay(options);
    
    // Log the created instance
    console.log('✅ Razorpay instance created successfully');
    console.log('🚀 Opening payment modal...');
    
    // Add error handling for the open() method
    try {
      razorpay.open();
    } catch (openError) {
      console.error('❌ Error opening Razorpay modal:', openError);
      
      // If modal opening fails, try direct checkout as fallback
      console.log('🔄 Falling back to direct checkout...');
      await initializeDirectCheckout(
        orderId,
        amount,
        currency,
        customerName,
        customerEmail,
        customerPhone,
        onSuccess,
        onFailure
      );
      return;
    }
    
  } catch (error) {
    console.error('❌ Error initializing payment:', error);
    
    // Check if it's a 400 Bad Request error
    if (error.message && error.message.includes('400')) {
      console.log('🔄 400 Bad Request detected, trying direct checkout fallback...');
      
      // Try direct checkout as fallback
      try {
        await initializeDirectCheckout(
          orderId,
          amount,
          currency,
          customerName,
          customerEmail,
          customerPhone,
          onSuccess,
          onFailure
        );
        return;
      } catch (fallbackError) {
        console.error('❌ Direct checkout fallback also failed:', fallbackError);
        onFailure(fallbackError);
        return;
      }
    }
    
    onFailure(error);
  }
};

// Alternative method: Direct checkout without script loading
export const initializeDirectCheckout = async (
  orderId: string,
  amount: number,
  currency: string = 'INR',
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  onSuccess: (response: any) => void,
  onFailure: (error: any) => void
) => {
  try {
    console.log('🚀 Initializing direct Razorpay checkout...');
    
    // Create checkout URL directly
    const checkoutUrl = `https://checkout.razorpay.com/v1/checkout.html?key=${RAZORPAY_CONFIG.key_id}&amount=${amount}&currency=${currency}&name=FIGURE%20IT%20OUT&description=Anime%20Collectibles%20Purchase&order_id=${orderId}&prefill[name]=${encodeURIComponent(customerName)}&prefill[email]=${encodeURIComponent(customerEmail)}&prefill[contact]=${encodeURIComponent(customerPhone)}&theme[color]=%23dc2626`;
    
    console.log('🔗 Direct checkout URL created:', checkoutUrl);
    
    // Open in new window/tab
    const checkoutWindow = window.open(checkoutUrl, '_blank', 'width=500,height=600');
    
    if (!checkoutWindow) {
      throw new Error('Failed to open checkout window');
    }
    
    // Listen for messages from checkout window
    const messageHandler = (event: MessageEvent) => {
      if (event.origin === 'https://checkout.razorpay.com') {
        console.log('✅ Payment message received:', event.data);
        onSuccess(event.data);
        checkoutWindow.close();
        window.removeEventListener('message', messageHandler);
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Fallback: check if window is closed
    const checkClosed = setInterval(() => {
      if (checkoutWindow.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        onFailure(new Error('Checkout window closed'));
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error initializing direct checkout:', error);
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
