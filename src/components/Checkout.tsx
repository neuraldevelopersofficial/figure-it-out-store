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
import { MapPin, Phone, Mail, CreditCard, Shield, Truck } from "lucide-react";

const Checkout = () => {
  const { user } = useAuth();
  const { state, getCartTotal, clearCart } = useStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
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

    setLoading(true);

    try {
      // Create order in your backend
      const orderData = {
        user_id: user.id,
        items: state.cart,
        total_amount: getCartTotal(),
        shipping_address: shippingAddress.address,
        shipping_city: shippingAddress.city,
        shipping_state: shippingAddress.state,
        shipping_pincode: shippingAddress.pincode,
        shipping_phone: shippingAddress.phone,
      };

      // This would typically be an API call to your backend
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const order = await orderResponse.json();

      // Initialize Razorpay payment
      await initializePayment(
        order.razorpay_order_id,
        getCartTotal(),
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
              await fetch(`/api/orders/${order.id}/confirm-payment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
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
              navigate(`/orders/${order.id}`);
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
    } catch (error) {
      toast({
        title: "Checkout Failed",
        description: "An error occurred during checkout. Please try again.",
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
                  <CardDescription>Secure payment via Razorpay</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">R</span>
                    </div>
                    <div>
                      <p className="font-medium">Razorpay</p>
                      <p className="text-sm text-muted-foreground">
                        Secure payment gateway
                      </p>
                    </div>
                  </div>
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
                {loading ? "Processing..." : `Pay ₹${finalTotal ? finalTotal.toLocaleString() : '0'}`}
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
