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

// User notification functions
const showUserNotification = (message: string, type: 'info' | 'warning' | 'error' = 'info') => {
  console.log(`🔔 User Notification [${type.toUpperCase()}]: ${message}`);
  
  // Try to show a browser notification if available
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('FIGURE IT OUT Store', {
      body: message,
      icon: '/logo.png'
    });
  }
  
  // Also try to show a toast notification if the app has a toast system
  if (typeof window !== 'undefined' && (window as any).showToast) {
    (window as any).showToast(message, type);
  }
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
      // Use a minimal valid configuration for testing
      try {
        const testOptions = {
          key: RAZORPAY_CONFIG.key_id,
          amount: 100, // 1 rupee in paise
          currency: 'INR',
          name: 'Test',
          description: 'Test payment'
        };
        const testInstance = new (window as any).Razorpay(testOptions);
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

// Initialize Razorpay payment using backend order
// ✅ Use order_id returned from backend - amount is tied to the order
export const initializePayment = async (
  orderId: string,
  currency: string = 'INR',
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  onSuccess: (response: any) => void,
  onFailure: (error: any) => void
) => {
  try {
    console.log('🚀 Initializing Razorpay payment with backend order...');
    console.log('🔍 Order ID from backend:', orderId);
    
    // Intercept network requests to detect 400 errors
    let hasNetworkError = false;
    let fallbackTriggered = false;
    
    // Monitor console for 400 errors
    const originalConsoleError = console.error;
    console.error = function(...args) {
      const message = args.join(' ');
      if (message.includes('400') || message.includes('Bad Request') || message.includes('v2-entry.modern.js')) {
        console.log('🔄 400 error detected in console, will trigger fallback');
        hasNetworkError = true;
      }
      return originalConsoleError.apply(this, args);
    };
    
    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && url.includes('razorpay.com')) {
        console.log('🌐 Intercepting Razorpay request:', url);
        
        return originalFetch.apply(this, args).then(response => {
          if (response.status === 400) {
            console.log('🔄 400 Bad Request detected in fetch, will trigger fallback');
            hasNetworkError = true;
          }
          return response;
        }).catch(error => {
          console.log('🌐 Fetch error detected:', error);
          hasNetworkError = true;
          throw error;
        });
      }
      return originalFetch.apply(this, args);
    };
    
    // Intercept XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      if (typeof url === 'string' && url.includes('razorpay.com')) {
        console.log('🌐 Intercepting Razorpay XHR request:', url);
        this._isRazorpayRequest = true;
      }
      return originalXHROpen.apply(this, [method, url, ...args]);
    };
    
    XMLHttpRequest.prototype.send = function(...args) {
      if (this._isRazorpayRequest) {
        this.addEventListener('readystatechange', () => {
          if (this.readyState === 4 && this.status === 400) {
            console.log('🔄 400 Bad Request detected in XHR, will trigger fallback');
            hasNetworkError = true;
          }
        });
      }
      return originalXHRSend.apply(this, args);
    };
    
    await loadRazorpayScript();

    // Validate inputs
    if (!orderId || !customerName || !customerEmail) {
      throw new Error('Missing required payment parameters');
    }

    // Create Razorpay options using backend order_id
    // IMPORTANT: Do NOT include 'amount' when using 'order_id' - amount is tied to the backend order
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
        // Restore original functions
        window.fetch = originalFetch;
        XMLHttpRequest.prototype.open = originalXHROpen;
        XMLHttpRequest.prototype.send = originalXHRSend;
        console.error = originalConsoleError;
        onSuccess(response);
      },
      modal: {
        ondismiss: () => {
          console.log('⚠️ Payment modal dismissed');
          // Restore original functions
          window.fetch = originalFetch;
          XMLHttpRequest.prototype.open = originalXHROpen;
          XMLHttpRequest.prototype.send = originalXHRSend;
          console.error = originalConsoleError;
          onFailure(new Error('Payment cancelled'));
        },
      }
      // Removed potentially problematic parameters:
      // - amount (conflicts with order_id - amount is tied to backend order)
      // - notes (might cause API compatibility issues)
      // - retry (not supported in all versions)
    };

    console.log('🔧 Razorpay payment options:', {
      key: options.key,
      currency: options.currency,
      order_id: options.order_id,
      mode: 'LIVE PRODUCTION',
      api_version: 'latest',
      note: 'Amount is tied to order_id from backend'
    });

    // Log the exact options object being passed to Razorpay
    console.log('🎯 Final Razorpay options object:', JSON.stringify(options, null, 2));
    console.log('🔍 Order ID being used:', orderId);
    console.log('💰 Amount is tied to backend order, not set in frontend options');

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
      
      // Check for network errors after a short delay
      setTimeout(() => {
        if (hasNetworkError && !fallbackTriggered) {
          console.log('🔄 Network error detected, triggering fallback...');
          fallbackTriggered = true;
          showUserNotification('Network error detected, using alternative checkout method...', 'warning');
          
          // Close the modal if it's open
          try {
            razorpay.close();
          } catch (e) {
            console.log('Modal already closed or not open');
          }
          
          // Restore original functions
          window.fetch = originalFetch;
          XMLHttpRequest.prototype.open = originalXHROpen;
          XMLHttpRequest.prototype.send = originalXHRSend;
          console.error = originalConsoleError;
          
          // Trigger fallback
          initializeDirectCheckout(
            orderId,
            currency,
            customerName,
            customerEmail,
            customerPhone,
            onSuccess,
            onFailure
          );
        }
      }, 1500); // Check after 1.5 seconds
      
      // Also add a more proactive check - if the modal doesn't show up after 2 seconds, use fallback
      setTimeout(() => {
        if (!fallbackTriggered) {
          // Check if there are any Razorpay elements visible on the page
          const razorpayElements = document.querySelectorAll('[class*="razorpay"], [id*="razorpay"]');
          const hasRazorpayUI = razorpayElements.length > 0;
          
          if (!hasRazorpayUI && !hasNetworkError) {
            console.log('🔄 Razorpay modal not visible, triggering fallback...');
            fallbackTriggered = true;
            showUserNotification('Payment modal not loading, using alternative checkout method...', 'warning');
            
            // Close the modal if it's open
            try {
              razorpay.close();
            } catch (e) {
              console.log('Modal already closed or not open');
            }
            
            // Restore original functions
            window.fetch = originalFetch;
            XMLHttpRequest.prototype.open = originalXHROpen;
            XMLHttpRequest.prototype.send = originalXHRSend;
            console.error = originalConsoleError;
            
            // Trigger fallback
            initializeDirectCheckout(
              orderId,
              currency,
              customerName,
              customerEmail,
              customerPhone,
              onSuccess,
              onFailure
            );
          }
        }
      }, 2000); // Check after 2 seconds
      
    } catch (openError) {
      console.error('❌ Error opening Razorpay modal:', openError);
      showUserNotification('Payment modal failed to open, trying alternative method...', 'warning');
      
      // Restore original functions
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalXHROpen;
      XMLHttpRequest.prototype.send = originalXHRSend;
      console.error = originalConsoleError;
      
      // If modal opening fails, try direct checkout as fallback
      console.log('🔄 Falling back to direct checkout...');
      await initializeDirectCheckout(
        orderId,
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
    
    // Check if it's a 400 Bad Request error or constructor error
    if (error.message && (
      error.message.includes('400') || 
      error.message.includes('constructor') || 
      error.message.includes('No key passed') ||
      error.message.includes('Bad Request') ||
      error.message.includes('v2-entry.modern.js')
    )) {
      console.log('🔄 Payment modal failed, trying direct checkout fallback...');
      showUserNotification('Payment modal failed, using alternative checkout method...', 'warning');
      
      // Try direct checkout as fallback
      try {
        await initializeDirectCheckout(
          orderId,
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
        showUserNotification('Both payment methods failed. Please contact support.', 'error');
        onFailure(fallbackError);
        return;
      }
    }
    
    onFailure(error);
  }
};

// Alternative method: Direct checkout without script loading
// ✅ Uses backend order_id - amount is tied to the order
export const initializeDirectCheckout = async (
  orderId: string,
  currency: string = 'INR',
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  onSuccess: (response: any) => void,
  onFailure: (error: any) => void
) => {
  try {
    console.log('🚀 Initializing direct Razorpay checkout with backend order...');
    console.log('🔍 Order ID from backend:', orderId);
    showUserNotification('Opening alternative checkout method...', 'info');
    
    // Create checkout URL directly with all necessary parameters
    // Note: amount is tied to order_id, so we don't need to set it separately
    const checkoutUrl = new URL('https://checkout.razorpay.com/v1/checkout.html');
    checkoutUrl.searchParams.set('key', RAZORPAY_CONFIG.key_id);
    // Note: amount is tied to order_id, so we don't need to set it separately
    checkoutUrl.searchParams.set('currency', currency);
    checkoutUrl.searchParams.set('name', 'FIGURE IT OUT');
    checkoutUrl.searchParams.set('description', 'Anime Collectibles Purchase');
    checkoutUrl.searchParams.set('order_id', orderId);
    checkoutUrl.searchParams.set('prefill[name]', customerName);
    checkoutUrl.searchParams.set('prefill[email]', customerEmail);
    checkoutUrl.searchParams.set('prefill[contact]', customerPhone);
    checkoutUrl.searchParams.set('theme[color]', '#dc2626');
    
    // Add callback URL for better integration
    const currentOrigin = window.location.origin;
    checkoutUrl.searchParams.set('callback_url', `${currentOrigin}/payment-success`);
    checkoutUrl.searchParams.set('cancel_url', `${currentOrigin}/payment-cancelled`);
    
    const finalUrl = checkoutUrl.toString();
    console.log('🔗 Direct checkout URL created:', finalUrl);
    console.log('💰 Amount is tied to backend order_id:', orderId);
    
    // Show user notification about fallback
    console.log('ℹ️ Using direct checkout as fallback method');
    
    // Open in new window/tab with better dimensions
    const checkoutWindow = window.open(finalUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
    
    if (!checkoutWindow) {
      const errorMsg = 'Failed to open checkout window. Please allow popups for this site.';
      showUserNotification(errorMsg, 'error');
      throw new Error(errorMsg);
    }
    
    console.log('✅ Direct checkout window opened successfully');
    showUserNotification('Checkout window opened successfully!', 'info');
    
    // Listen for messages from checkout window
    const messageHandler = (event: MessageEvent) => {
      if (event.origin === 'https://checkout.razorpay.com') {
        console.log('✅ Payment message received:', event.data);
        showUserNotification('Payment completed successfully!', 'info');
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
        console.log('⚠️ Direct checkout window was closed');
        showUserNotification('Checkout window was closed', 'warning');
        onFailure(new Error('Checkout window closed'));
      }
    }, 1000);
    
    // Add a timeout for the checkout process
    setTimeout(() => {
      if (!checkoutWindow.closed) {
        console.log('⏰ Direct checkout timeout - checking window status');
        // Don't close the window, just log the timeout
      }
    }, 300000); // 5 minutes timeout
    
    // Also check for URL changes in the checkout window (if possible)
    try {
      const checkUrlChange = setInterval(() => {
        try {
          if (checkoutWindow.location.href.includes('payment-success') || 
              checkoutWindow.location.href.includes('payment-cancelled')) {
            clearInterval(checkUrlChange);
            console.log('✅ Payment completed via URL change detection');
            checkoutWindow.close();
            onSuccess({ status: 'success', method: 'direct_checkout' });
          }
        } catch (e) {
          // Cross-origin restrictions might prevent this
          console.log('Cannot check checkout window URL due to cross-origin restrictions');
        }
      }, 2000);
    } catch (e) {
      console.log('URL change detection not available due to cross-origin restrictions');
    }
    
  } catch (error) {
    console.error('❌ Error initializing direct checkout:', error);
    showUserNotification('Failed to open checkout: ' + error.message, 'error');
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
