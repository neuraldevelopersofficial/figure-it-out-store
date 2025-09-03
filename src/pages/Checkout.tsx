import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FallbackImage } from '@/components/ui/fallback-image';
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
  
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

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
      // Check if COD is allowed (only for orders above ₹1000)
      if (paymentMethod === 'cod' && cartTotal < 1000) {
        toast({
          title: "Cash on Delivery not available",
          description: "Cash on Delivery is only available for orders above ₹1000.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Create order in backend
      const orderData = {
        items: cartItems,
        total_amount: cartTotal,
        shipping_address: shippingAddress.address,
        shipping_city: shippingAddress.city,
        shipping_state: shippingAddress.state,
        shipping_pincode: shippingAddress.pincode,
        shipping_phone: shippingAddress.phone,
        payment_method: paymentMethod
      };

      const orderResponse = await apiClient.createOrder(orderData);
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.error || 'Failed to create order');
      }

      // For COD, skip Razorpay and complete the order directly
      if (paymentMethod === 'cod') {
        // Update order status to confirmed for COD
        await apiClient.updateOrderStatus(orderResponse.order.id, 'confirmed');
        
        // Clear cart
        clearCart();
        
        toast({
          title: "Order placed successfully!",
          description: "Your Cash on Delivery order has been placed.",
        });

        // Redirect to order confirmation
        navigate('/orders');
        setLoading(false);
        return;
      }
      
      // For Razorpay, create payment order using backend
      console.log('🛒 Creating Razorpay order via backend...');
      const razorpayResponse = await apiClient.createRazorpayOrder(cartTotal);
      
      if (!razorpayResponse.success) {
        throw new Error(razorpayResponse.error || 'Failed to create payment order');
      }

      console.log('✅ Backend Razorpay order created:', {
        order_id: razorpayResponse.order_id,
        amount: razorpayResponse.amount,
        currency: razorpayResponse.currency
      });

      // Import and use the proper Razorpay integration with fallback
      const { initializePayment, initializeDirectCheckout } = await import('@/lib/razorpay');
      
      // Try the main Razorpay integration first
      try {
        console.log('🚀 Initializing main Razorpay payment...');
        console.log('⚠️ Note: If Razorpay modal fails, automatic fallback to direct checkout will be used');
        
        await initializePayment(
          razorpayResponse.order_id,
          razorpayResponse.currency || 'INR',
          user.full_name,
          user.email,
          shippingAddress.phone || '',
          async (paymentResponse: any) => {
            try {
              console.log('✅ Payment successful:', paymentResponse);
              
              // Verify payment signature with backend
              console.log('🔍 Verifying payment signature...');
              const verificationData = {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                method: 'razorpay' // Regular Razorpay payment
              };
              
              console.log('📤 Sending verification request with data:', verificationData);
              
              const verificationResponse = await apiClient.verifyPayment(verificationData);

              if (verificationResponse.success && verificationResponse.verified) {
                console.log('✅ Payment verification successful');
                
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
                console.error('❌ Payment verification failed:', verificationResponse);
                throw new Error('Payment verification failed');
              }
            } catch (error) {
              console.error('❌ Payment verification error:', error);
              toast({
                title: "Payment verification failed",
                description: "Please contact support for assistance.",
                variant: "destructive"
              });
            }
          },
          (error: any) => {
            console.error('❌ Payment failed:', error);
            toast({
              title: "Payment failed",
              description: error.message || "Payment was not completed",
              variant: "destructive"
            });
          },
          false // Don't force direct checkout initially
        );
      } catch (error) {
        console.log('⚠️ Main Razorpay integration failed, trying direct checkout...', error);
        
        // Show user notification about fallback
        toast({
          title: "Using alternative payment method",
          description: "Opening direct checkout due to payment modal issues.",
          variant: "default"
        });
        
        // Fallback to direct checkout method
        try {
          console.log('🔄 Initializing direct checkout fallback...');
          await initializeDirectCheckout(
            razorpayResponse.order_id,
            razorpayResponse.currency || 'INR',
            user.full_name,
            user.email,
            shippingAddress.phone || '',
            async (paymentResponse: any) => {
              try {
                console.log('✅ Direct checkout payment successful:', paymentResponse);
                
                // Verify payment signature with backend
                console.log('🔍 Verifying direct checkout payment signature...');
                const verificationData = {
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                  method: 'custom_form' // Always use custom_form for direct checkout
                };
                
                console.log('📤 Sending verification request with data:', verificationData);
                
                const verificationResponse = await apiClient.verifyPayment(verificationData);

                if (verificationResponse.success && verificationResponse.verified) {
                  console.log('✅ Direct checkout payment verification successful');
                  
                  // Update order status
                  await apiClient.updateOrderStatus(orderResponse.order.id, 'confirmed');
                  
                  // Clear cart
                  clearCart();
                  
                  toast({
                    title: "Payment successful!",
                    description: "Your order has been placed successfully via direct checkout.",
                  });

                  // Redirect to order confirmation
                  navigate('/orders');
                } else {
                  console.error('❌ Direct checkout payment verification failed:', verificationResponse);
                  throw new Error('Payment verification failed');
                }
              } catch (error) {
                console.error('❌ Direct checkout payment verification error:', error);
                toast({
                  title: "Payment verification failed",
                  description: "Please contact support for assistance.",
                  variant: "destructive"
                });
              }
            },
            (error: any) => {
              console.error('❌ Direct checkout failed:', error);
              toast({
                title: "Payment failed",
                description: "Both payment methods failed. Please contact support.",
                variant: "destructive"
              });
            }
          );
        } catch (fallbackError) {
          console.error('❌ Direct checkout fallback also failed:', fallbackError);
          toast({
            title: "All payment methods failed",
            description: "Please contact support for assistance.",
            variant: "destructive"
          });
        }
      }

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
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mb-6">
                <div className="flex items-center space-x-2 p-2 border rounded-md mb-2">
                  <RadioGroupItem value="razorpay" id="razorpay" />
                  <label htmlFor="razorpay" className="flex items-center cursor-pointer">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">R</span>
                    </div>
                    <div>
                      <p className="font-medium">Razorpay</p>
                      <p className="text-sm text-gray-500">Credit/Debit Card, UPI, Netbanking</p>
                    </div>
                  </label>
                </div>
                
                <div className="flex items-center space-x-2 p-2 border rounded-md">
                  <RadioGroupItem value="cod" id="cod" disabled={cartTotal < 1000} />
                  <label htmlFor="cod" className={`flex items-center ${cartTotal < 1000 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">₹</span>
                    </div>
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">{cartTotal < 1000 ? 'Available only for orders above ₹1000' : 'Pay when you receive'}</p>
                    </div>
                  </label>
                </div>
              </RadioGroup>
              
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <FallbackImage
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                        fallbackSrc="https://via.placeholder.com/50"
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
                {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (Cash on Delivery)' : 'Proceed to Payment'}
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
