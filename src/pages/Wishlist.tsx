import { Link } from "react-router-dom";
import { Heart, ShoppingCart, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/context/StoreContext";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Wishlist = () => {
  const { state, removeFromWishlist, addToCart } = useStore();
  const wishlistItems = state.wishlist;

  const handleAddToCart = (productId: string) => {
    const product = wishlistItems.find(item => item.id === productId);
    if (product) {
      addToCart(product);
    }
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-6xl mb-6">💝</div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Your wishlist is empty
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Start building your wishlist by browsing our collection and 
              adding items you love!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button size="lg" className="bg-brand-red hover:bg-brand-red-dark">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Start Shopping
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
            <h1 className="text-2xl font-bold text-foreground">My Wishlist</h1>
            <Badge variant="secondary" className="ml-2">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Wishlist Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {wishlistItems.map((item) => (
            <div key={item.id} className="relative group">
              {/* Wishlist Item Card */}
              <div className="bg-background border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="sm"
                      className="bg-brand-red hover:bg-brand-red-dark text-white"
                      onClick={() => handleAddToCart(item.id)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add to Cart
                    </Button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {item.isNew && (
                      <Badge className="bg-green-500 text-white text-xs">
                        NEW
                      </Badge>
                    )}
                    {item.isOnSale && (
                      <Badge className="bg-brand-red text-white text-xs">
                        -{item.discount}%
                      </Badge>
                    )}
                  </div>

                  {/* Remove from Wishlist Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-3 right-3 h-8 w-8 p-0 rounded-full bg-white/90 text-red-500 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleRemoveFromWishlist(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Category */}
                  <div className="text-xs text-muted-foreground mb-2">
                    {item.category}
                  </div>

                  {/* Title */}
                  <Link to={`/product/${item.id}`}>
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2 hover:text-brand-red transition-colors">
                      {item.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-foreground">
                      ₹{item.price.toLocaleString()}
                    </span>
                    {item.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{item.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  {!item.inStock && (
                    <div className="text-sm text-red-500 font-medium mb-3">
                      Out of Stock
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-brand-red hover:bg-brand-red-dark text-white"
                      disabled={!item.inStock}
                      onClick={() => handleAddToCart(item.id)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="text-red-500 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="outline" size="lg">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <Link to="/cart">
              <Button size="lg" className="bg-brand-red hover:bg-brand-red-dark">
                <ShoppingCart className="h-5 w-5 mr-2" />
                View Cart ({state.cart.length})
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Items in your wishlist are saved for later. Add them to your cart when you're ready to purchase!
          </p>
        </div>

        {/* Recommendations */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Discover more products you might love
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* This would show personalized recommendations */}
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

export default Wishlist;
