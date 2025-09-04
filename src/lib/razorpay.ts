// Simple Razorpay Integration
export const RAZORPAY_CONFIG = {
  key_id: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_RD4Ia7eTGct90w',
  currency: 'INR'
};

// Get API URL
const getApiUrl = () => {
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://api.figureitoutstore.in/api';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

// Create Razorpay order
export const createRazorpayOrder = async (amount: number) => {
  const response = await fetch(`${getApiUrl()}/razorpay/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency: 'INR' }),
  });

  if (!response.ok) {
    throw new Error('Failed to create order');
  }

  return response.json();
};

// Load Razorpay script
const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
};

// Initialize payment
export const initializePayment = async (
  orderId: string,
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
      amount: 0, // Amount is tied to order_id
      currency: 'INR',
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
      }
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();

  } catch (error) {
    onFailure(error);
  }
};

// Verify payment
export const verifyPayment = async (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) => {
  const response = await fetch(`${getApiUrl()}/razorpay/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    }),
  });

  if (!response.ok) {
    throw new Error('Payment verification failed');
  }

  return response.json();
};