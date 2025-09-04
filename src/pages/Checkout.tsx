import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useStore, Address } from '@/context/StoreContext';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { initializePayment, verifyPayment } from '@/lib/razorpay';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FallbackImage } from '@/components/ui/fallback-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Check } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Checkout: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { state, getCartTotal, clearCart, addresses } = useStore();
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
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressSelection, setShowAddressSelection] = useState(false);
  const [useSavedAddress, setUseSavedAddress] = useState(false);

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

    // Pre-fill shipping address from user profile or default address
    if (user) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      if (defaultAddress && addresses.length > 0) {
        // Build complete address from addressLine1 and addressLine2
        const fullAddress = [
          defaultAddress.addressLine1 || '',
          defaultAddress.addressLine2 || ''
        ].filter(Boolean).join(', ');
        
        setShippingAddress({
          address: fullAddress || '',
          city: defaultAddress.city || '',
          state: defaultAddress.state || '',
          pincode: defaultAddress.pincode || '',
          phone: defaultAddress.phone || ''
        });
        setSelectedAddressId(defaultAddress.id);
        setUseSavedAddress(true);
      } else {
        setShippingAddress({
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          pincode: user.pincode || '',
          phone: user.phone || ''
        });
      }
    }
  }, [user, navigate, cartItems.length, toast, addresses]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShippingAddress(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAddressSelect = (address: Address) => {
    // Build complete address from addressLine1 and addressLine2
    const fullAddress = [
      address.addressLine1 || '',
      address.addressLine2 || ''
    ].filter(Boolean).join(', ');
    
    setShippingAddress({
      address: fullAddress || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      phone: address.phone || ''
    });
    setSelectedAddressId(address.id);
    setUseSavedAddress(true);
    setShowAddressSelection(false);
  };

  const handleUseNewAddress = () => {
    setUseSavedAddress(false);
    setSelectedAddressId(null);
    setShippingAddress({
      address: '',
      city: '',
      state: '',
      pincode: '',
      phone: ''
    });
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
    if (!useSavedAddress && (!shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode)) {
      toast({
        title: "Incomplete shipping address",
        description: "Please fill in all required shipping address fields.",
        variant: "destructive"
      });
      return;
    }

    // Additional validation for saved addresses
    if (useSavedAddress && selectedAddressId) {
      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
      if (!selectedAddress) {
        toast({
          title: "Invalid address selection",
          description: "Please select a valid address or use a new address.",
          variant: "destructive"
        });
        return;
      }
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
      let finalShippingAddress = shippingAddress;
      
      // If using saved address, get the complete address data
      if (useSavedAddress && selectedAddressId) {
        const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
        if (selectedAddress) {
          // Build complete address from addressLine1 and addressLine2
          const fullAddress = [
            selectedAddress.addressLine1 || '',
            selectedAddress.addressLine2 || ''
          ].filter(Boolean).join(', ');
          
          finalShippingAddress = {
            address: fullAddress || '',
            city: selectedAddress.city || '',
            state: selectedAddress.state || '',
            pincode: selectedAddress.pincode || '',
            phone: selectedAddress.phone || ''
          };
          
          console.log('🔍 Selected address data:', {
            selectedAddress,
            finalShippingAddress,
            fullAddress
          });
        }
      }

      // Final validation of address data
      if (!finalShippingAddress.address || !finalShippingAddress.city || !finalShippingAddress.state || !finalShippingAddress.pincode) {
        console.error('❌ Final address validation failed:', finalShippingAddress);
        toast({
          title: "Address validation failed",
          description: "Please ensure all address fields are properly filled.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const orderData = {
        items: cartItems,
        total_amount: cartTotal,
        shipping_address: finalShippingAddress.address,
        shipping_city: finalShippingAddress.city,
        shipping_state: finalShippingAddress.state,
        shipping_pincode: finalShippingAddress.pincode,
        shipping_phone: finalShippingAddress.phone,
        payment_method: paymentMethod
      };

      console.log('🔍 Order data being sent:', {
        useSavedAddress,
        selectedAddressId,
        finalShippingAddress,
        orderData,
        addressFields: {
          address: finalShippingAddress.address,
          city: finalShippingAddress.city,
          state: finalShippingAddress.state,
          pincode: finalShippingAddress.pincode,
          phone: finalShippingAddress.phone
        }
      });

      const orderResponse = await apiClient.createOrder(orderData);
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.error || 'Failed to create order');
      }

      console.log('✅ Order created successfully:', {
        orderId: orderResponse.order.id,
        orderData: orderResponse.order
      });

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
      const razorpayResponse = await apiClient.createRazorpayOrder(cartTotal);
      
      if (!razorpayResponse.success) {
        throw new Error(razorpayResponse.error || 'Failed to create payment order');
      }

      console.log('✅ Backend Razorpay order created:', {
        order_id: razorpayResponse.order_id,
        amount: razorpayResponse.amount,
        currency: razorpayResponse.currency
      });

      // Initialize Razorpay payment
      await initializePayment(
        razorpayResponse.order_id,
        user.full_name,
        user.email,
        shippingAddress.phone || '',
        async (paymentResponse: any) => {
          try {
            console.log('✅ Payment successful:', paymentResponse);
            
            // Verify payment signature
            const verificationResponse = await verifyPayment(
              paymentResponse.razorpay_order_id,
              paymentResponse.razorpay_payment_id,
              paymentResponse.razorpay_signature
            );

            if (verificationResponse.success && verificationResponse.verified) {
              // Update order status using our database order ID (not Razorpay order ID)
              console.log('🔄 Updating order status:', {
                orderId: orderResponse.order.id,
                status: 'confirmed'
              });
              
              try {
                await apiClient.updateOrderStatus(orderResponse.order.id, 'confirmed');
                console.log('✅ Order status updated successfully');
              } catch (statusError) {
                console.error('❌ Failed to update order status:', statusError);
                // Don't fail the entire flow if status update fails
                // The payment was successful, so we should still proceed
              }
              
              // Clear cart
              clearCart();
              
              toast({
                title: "Payment successful!",
                description: "Your order has been placed successfully. Invoice will be available in your orders.",
              });

              // Redirect to order confirmation
              navigate('/orders');
            } else {
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
        }
      );

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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Shipping Address</h2>
                {addresses.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddressSelection(!showAddressSelection)}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {useSavedAddress ? 'Change Address' : 'Use Saved Address'}
                  </Button>
                )}
              </div>

              {/* Address Selection Modal */}
              {showAddressSelection && addresses.length > 0 && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium mb-3">Select Address</h3>
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <Card 
                        key={address.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedAddressId === address.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handleAddressSelect(address)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{address.name}</span>
                                {address.isDefault && (
                                  <Badge variant="secondary" className="text-xs">Default</Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {address.addressType}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{address.addressLine1}</p>
                              {address.addressLine2 && (
                                <p className="text-sm text-gray-600 mb-1">{address.addressLine2}</p>
                              )}
                              <p className="text-sm text-gray-600">
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                              {address.phone && (
                                <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                              )}
                            </div>
                            {selectedAddressId === address.id && (
                              <Check className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleUseNewAddress}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Use New Address
                    </Button>
                  </div>
                </div>
              )}

              {/* Current Address Display */}
              {useSavedAddress && selectedAddressId && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Using Saved Address</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {addresses.find(addr => addr.id === selectedAddressId)?.name} - 
                    {addresses.find(addr => addr.id === selectedAddressId)?.addressType}
                  </p>
                </div>
              )}

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
                    disabled={useSavedAddress}
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
                      disabled={useSavedAddress}
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
                      disabled={useSavedAddress}
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
                      disabled={useSavedAddress}
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
                      disabled={useSavedAddress}
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
