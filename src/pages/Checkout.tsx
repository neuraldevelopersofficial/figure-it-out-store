import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Checkout: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { state, getCartTotal, clearCart } = useStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  const [loading, setLoading] = useState(false);

  // Add null checks for cart
  const cartItems = state?.cart || [];
  const cartTotal = getCartTotal();

  // Add loading state to prevent undefined errors
  if (!state) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Redirect if cart is empty
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout.",
        variant: "destructive"
      });
      navigate('/cart');
      return;
    }

    // Pre-fill shipping address from user profile
    if (user) {
      setShippingAddress({
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        phone: user.phone || ''
      });
    }
  }, [user, navigate, cartItems.length, toast]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShippingAddress(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Please log in to continue",
        description: "You need to be logged in to checkout.",
        variant: "destructive"
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout.",
        variant: "destructive"
      });
      return;
    }

    // Validate shipping address
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      toast({
        title: "Incomplete shipping address",
        description: "Please fill in all required shipping address fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Create order in backend
      const orderData = {
        items: cartItems,
        total_amount: cartTotal,
        shipping_address: shippingAddress.address,
        shipping_city: shippingAddress.city,
        shipping_state: shippingAddress.state,
        shipping_pincode: shippingAddress.pincode,
        shipping_phone: shippingAddress.phone
      };

      const orderResponse = await apiClient.createOrder(orderData);
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.error || 'Failed to create order');
      }

      // Create Razorpay order
      const razorpayResponse = await apiClient.createRazorpayOrder(cartTotal);
      
      if (!razorpayResponse.success) {
        throw new Error(razorpayResponse.error || 'Failed to create payment order');
      }

      // Initialize Razorpay payment
      const options = {
        key: 'rzp_live_RD4Ia7eTGct90w', // Your Razorpay live key
        amount: razorpayResponse.amount,
        currency: razorpayResponse.currency || 'INR',
        name: 'Figure It Out Store',
        description: `Order #${orderResponse.order.id}`,
        order_id: razorpayResponse.order_id,
        handler: async function (response: any) {
          try {
            // Verify payment signature
            const verificationResponse = await apiClient.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verificationResponse.success && verificationResponse.verified) {
              // Update order status
              await apiClient.updateOrderStatus(orderResponse.order.id, 'confirmed');
              
              // Clear cart
              clearCart();
              
              toast({
                title: "Payment successful!",
                description: "Your order has been placed successfully.",
              });

              // Redirect to order confirmation
              navigate('/orders');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment verification failed",
              description: "Please contact support for assistance.",
              variant: "destructive"
            });
          }
        },
        prefill: {
          name: user.full_name,
          email: user.email,
          contact: shippingAddress.phone
        },
        theme: {
          color: '#3B82F6'
        }
      };

      // Load Razorpay script and initialize payment
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const razorpay = (window as any).Razorpay;
        const rzp = new razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: error.message || "An error occurred during checkout.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <select
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select State</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={shippingAddress.pincode}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{cartTotal}</span>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={loading || cartItems.length === 0}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;
