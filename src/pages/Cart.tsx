import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FallbackImage } from '@/components/ui/fallback-image';
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  Heart 
} from 'lucide-react';

const Cart: React.FC = () => {
  const { state, removeFromCart, updateCartQuantity, getCartTotal, clearCart } = useStore();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const cartItems = state?.cart || [];
  const cartTotal = getCartTotal();
  const shippingThreshold = 1000; // Free shipping above ₹1000
  const shippingCost = cartTotal >= shippingThreshold ? 0 : 100;
  const finalTotal = cartTotal + shippingCost;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Add loading state to prevent undefined errors
  if (!state) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cart...</p>
        </div>
      </div>
    );
  }

  // Debug info (remove this in production)
  const debugInfo = process.env.NODE_ENV === 'development' && (
    <div className="bg-yellow-100 p-2 mb-4 rounded text-xs">
      <strong>Debug:</strong> User ID: {state.currentUserId || 'Guest'} | Cart Items: {cartItems.length}
    </div>
  );

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCartQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart.",
    });
  };

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to checkout.",
        variant: "destructive"
      });
      navigate('/login');
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

    // Navigate to checkout page
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-6xl mb-6">🛒</div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Your cart is empty
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. 
              Start shopping to fill it up!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button size="lg" className="bg-brand-red hover:bg-brand-red-dark">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
              <Link to="/anime-figures">
                <Button size="lg" variant="outline">
                  Browse Anime Figures
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Shopping Cart</h1>
            <Badge variant="secondary" className="ml-2">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {debugInfo}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Cart Items ({cartItems.length})
            </h2>
            
            {cartItems.map((item) => {
              console.log('🛒 Cart item image:', item.image, 'for product:', item.name);
              return (
              <div key={item.id} className="border border-border rounded-lg p-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <FallbackImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      fallbackSrc="/placeholder-image.png"
                      debug={true}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.category}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-foreground">
                            ₹{item.price ? item.price.toLocaleString() : '0'}
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{item.originalPrice ? item.originalPrice.toLocaleString() : '0'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border rounded-md">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-3 py-1"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-4 py-2 min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={item.quantity >= 10}
                          className="px-3 py-1"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total</div>
                        <div className="font-semibold text-foreground">
                          ₹{item.price ? (item.price * item.quantity).toLocaleString() : '0'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}

            {/* Clear Cart */}
            <div className="text-center">
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="border border-border rounded-lg p-6 bg-gray-50">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Order Summary
                </h2>

                {/* Summary Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{cartTotal ? cartTotal.toLocaleString() : '0'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shippingCost === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `₹${shippingCost}`
                      )}
                    </span>
                  </div>

                  {shippingCost > 0 && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                      Add ₹{cartTotal ? (shippingThreshold - cartTotal).toLocaleString() : '0'} more for free shipping!
                    </div>
                  )}

                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{finalTotal ? finalTotal.toLocaleString() : '0'}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  className="w-full !bg-brand-red hover:bg-brand-red-dark text-white py-3 text-lg"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    "Processing..."
                  ) : (
                    <>
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      Proceed to Checkout
                    </>
                  )}
                </Button>

                {/* Additional Info */}
                <div className="mt-4 text-sm text-muted-foreground text-center">
                  <p>Secure checkout powered by Razorpay</p>
                  <p className="mt-1">Free returns within 7 days</p>
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="mt-4 text-center">
                <Link to="/">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            You might also like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* This would show recommended products based on cart items */}
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Personalized recommendations coming soon!</p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
