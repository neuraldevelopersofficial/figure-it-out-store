// Razorpay configuration
export const RAZORPAY_CONFIG = {
  key_id: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_RD4Ia7eTGct90w',
  key_secret: import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'B18FWmc6yNaaVSQkPDULsJ2U',
  currency: 'INR',
};

// Load Razorpay script
export const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://checkout.razorpay.com/v1/checkout.js?_=${new Date().getTime()}`;
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });
};

// Create Razorpay order
// ✅ Send amount in rupees, backend will convert to paise
export const createRazorpayOrder = async (amount: number, currency: string = 'INR') => {
  try {
    const response = await fetch('/api/create-order', {
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
      throw new Error('Failed to create order');
    }

    const order = await response.json();
    return order; // contains { order_id, amount, currency }
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

// Initialize Razorpay payment
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
    await loadRazorpayScript();

    const options = {
      key: RAZORPAY_CONFIG.key_id,
      amount,            // use backend value (already in paise)
      currency,
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
      handler: onSuccess,
      modal: {
        ondismiss: () => onFailure(new Error('Payment cancelled')),
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error('Error initializing payment:', error);
    onFailure(error);
  }
};

// Verify payment signature
export const verifyPaymentSignature = async (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
) => {
  try {
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        signature,
      }),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    const result = await response.json();
    return result.verified;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
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
