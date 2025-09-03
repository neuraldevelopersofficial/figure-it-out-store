import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { initializePayment, verifyPaymentSignature } from "@/lib/razorpay";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Mail, CreditCard, Shield, Truck, Cash } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/lib/api";

const Checkout = () => {
  const { user } = useAuth();
  const { state, getCartTotal, clearCart } = useStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const apiClient = api();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [shippingAddress, setShippingAddress] = useState({
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    pincode: user?.pincode || "",
    phone: user?.phone || "",
  });

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to proceed with checkout",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (state.cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add some products to checkout.",
        variant: "destructive",
      });
      navigate("/cart");
      return;
    }
  }, [user, state.cart, navigate, toast]);

  const handleAddressChange = (field: string, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckout = async () => {
    if (!user) return;

    // Validate shipping address
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      toast({
        title: "Incomplete Address",
        description: "Please fill in all address fields",
        variant: "destructive",
      });
      return;
    }

    // Validate COD eligibility
    const cartTotal = getCartTotal();
    if (paymentMethod === "cod" && cartTotal < 1000) {
      toast({
        title: "Cash on Delivery not available",
        description: "Cash on Delivery is only available for orders above ₹1000",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create order in your backend
      const orderData = {
        user_id: user.id,
        items: state.cart,
        total_amount: cartTotal,
        shipping_address: shippingAddress.address,
        shipping_city: shippingAddress.city,
        shipping_state: shippingAddress.state,
        shipping_pincode: shippingAddress.pincode,
        shipping_phone: shippingAddress.phone,
        payment_method: paymentMethod
      };

      // Create order via API
      const orderResponse = await apiClient.createOrder(orderData);
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.error || 'Failed to create order');
      }

      // For COD, skip Razorpay and complete the order directly
      if (paymentMethod === 'cod') {
        toast({
          title: "Order Placed Successfully!",
          description: "Your Cash on Delivery order has been confirmed.",
        });

        clearCart();
        navigate('/orders');
        return;
      }

      // For Razorpay payments, initialize payment
      await initializePayment(
        orderResponse.order.razorpay_order_id,
        cartTotal,
        'INR',
        user.full_name,
        user.email,
        shippingAddress.phone || user.phone || '',
        async (paymentResponse: any) => {
          // Payment successful
          try {
            const isVerified = await verifyPaymentSignature(
              paymentResponse.razorpay_order_id,
              paymentResponse.razorpay_payment_id,
              paymentResponse.razorpay_signature
            );

            if (isVerified) {
              // Update order status
              await apiClient.request(`/orders/${orderResponse.order.id}/confirm-payment`, {
                method: 'POST',
                body: JSON.stringify({
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                }),
              });

              toast({
                title: "Payment Successful!",
                description: "Your order has been placed successfully.",
              });

              clearCart();
              navigate('/orders');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support for assistance.",
              variant: "destructive",
            });
          }
        },
        (error: any) => {
          toast({
            title: "Payment Failed",
            description: error.message || "Payment was not completed",
            variant: "destructive",
          });
        }
      );
    } catch (error: any) {
      toast({
        title: "Checkout Failed",
        description: error.message || "An error occurred during checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || state.cart.length === 0) {
    return null;
  }

  const cartTotal = getCartTotal();
  const shippingCost = cartTotal > 999 ? 0 : 99;
  const finalTotal = cartTotal + shippingCost;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Order Details & Shipping */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>Review your cart items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {state.cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Shipping Address
                  </CardTitle>
                  <CardDescription>Where should we deliver your order?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={shippingAddress.address}
                      onChange={(e) => handleAddressChange("address", e.target.value)}
                      placeholder="Enter your full address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => handleAddressChange("city", e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) => handleAddressChange("state", e.target.value)}
                        placeholder="State"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        value={shippingAddress.pincode}
                        onChange={(e) => handleAddressChange("pincode", e.target.value)}
                        placeholder="Pincode"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={shippingAddress.phone}
                        onChange={(e) => handleAddressChange("phone", e.target.value)}
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Payment Summary */}
            <div className="space-y-6">
              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                  <CardDescription>Review your order total</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{cartTotal ? cartTotal.toLocaleString() : '0'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className={shippingCost === 0 ? "text-green-600" : ""}>
                        {shippingCost === 0 ? "Free" : `₹${shippingCost}`}
                      </span>
                    </div>
                    
                    {shippingCost === 0 && (
                      <div className="text-sm text-green-600 flex items-center">
                        <Truck className="h-4 w-4 mr-1" />
                        Free shipping on orders above ₹999
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{finalTotal ? finalTotal.toLocaleString() : '0'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Method
                  </CardTitle>
                  <CardDescription>Choose your preferred payment method</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={paymentMethod} 
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                  >
                    <div className={`flex items-center space-x-3 p-3 border rounded-lg ${paymentMethod === 'razorpay' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                      <RadioGroupItem value="razorpay" id="razorpay" />
                      <Label htmlFor="razorpay" className="flex items-center cursor-pointer flex-1">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                          <span className="text-white text-xs font-bold">R</span>
                        </div>
                        <div>
                          <p className="font-medium">Razorpay</p>
                          <p className="text-sm text-muted-foreground">
                            Secure online payment
                          </p>
                        </div>
                      </Label>
                    </div>
                    
                    <div className={`flex items-center space-x-3 p-3 border rounded-lg ${paymentMethod === 'cod' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'} ${cartTotal < 1000 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <RadioGroupItem 
                        value="cod" 
                        id="cod" 
                        disabled={cartTotal < 1000}
                      />
                      <Label htmlFor="cod" className={`flex items-center cursor-pointer flex-1 ${cartTotal < 1000 ? 'cursor-not-allowed' : ''}`}>
                        <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center mr-3">
                          <Cash className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-sm text-muted-foreground">
                            Pay when you receive your order
                            {cartTotal < 1000 && <span className="block text-red-500 font-medium">Available for orders above ₹1000</span>}
                          </p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Security & Trust */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Security & Trust
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-green-600" />
                      <span>256-bit SSL encryption</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-green-600" />
                      <span>PCI DSS compliant</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-green-600" />
                      <span>Secure payment processing</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full h-12 text-lg"
              >
                {loading ? "Processing..." : paymentMethod === 'cod' 
                  ? `Place Order - ₹${finalTotal ? finalTotal.toLocaleString() : '0'} (COD)` 
                  : `Pay ₹${finalTotal ? finalTotal.toLocaleString() : '0'}`}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By clicking "Pay", you agree to our terms of service and privacy policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
