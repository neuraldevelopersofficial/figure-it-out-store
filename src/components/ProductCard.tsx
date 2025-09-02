import { useState } from "react";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useStore } from "@/context/StoreContext";
import { Product } from "@/context/StoreContext";
import { useToast } from "@/hooks/use-toast";
import { convertGoogleDriveUrl, getGoogleDriveProxyUrl } from "@/lib/utils";
import { FallbackImage } from "@/components/ui/fallback-image";
import { MotionCard } from "@/components/ui/motion-card";

interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
  delay?: number;
}

const ProductCard = ({ product, showQuickView = true, delay = 0 }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore();
  const { toast } = useToast();
  const isWishlisted = isInWishlist(product.id);

  // Combine all images for cycling
const allImages = [product.image].filter(Boolean);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist(product);
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <MotionCard
      delay={delay}
      className="group relative bg-background border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => {
        setIsHovered(true);
        // Start cycling through images if there are multiple
        if (allImages.length > 1) {
          const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % allImages.length);
          }, 1000); // Change image every second
          
          // Store interval ID to clear it on mouse leave
          (window as any).imageCycleInterval = interval;
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0); // Reset to first image
        // Clear the interval
        if ((window as any).imageCycleInterval) {
          clearInterval((window as any).imageCycleInterval);
        }
      }}
    >
      {/* Image Container - Clickable */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <FallbackImage
            src={allImages[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
            fallbackSrc="/placeholder-image.png"
          />
          
          {/* Image counter indicator */}
          {allImages.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          )}
          
          {/* Overlay with actions */}
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            {showQuickView && (
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white text-foreground"
              >
                <Eye className="h-4 w-4 mr-1" />
                Quick View
              </Button>
            )}
            
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white text-foreground"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add to Cart
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-green-500 text-white text-xs">
                NEW
              </Badge>
            )}
            {product.isOnSale && (
              <Badge className="bg-brand-red text-white text-xs">
                -{product.discount}%
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            size="sm"
            variant="ghost"
            className={`absolute top-3 right-3 h-8 w-8 p-0 rounded-full transition-all duration-200 ${
              isWishlisted 
                ? 'bg-brand-red text-white hover:bg-brand-red-dark' 
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-brand-red'
            }`}
            onClick={handleWishlistToggle}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <div className="text-xs text-muted-foreground mb-2">
          {product.category}
        </div>

        {/* Title */}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 hover:text-brand-red transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating removed for first launch */}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-foreground">
            ₹{product.price ? product.price.toLocaleString() : '0'}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.originalPrice ? product.originalPrice.toLocaleString() : '0'}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {!product.inStock && (
          <div className="text-sm text-red-500 font-medium mb-3">
            Out of Stock
          </div>
        )}

        {/* Add to Cart Button */}
        <Button
          className="w-full bg-brand-red hover:bg-brand-red-dark text-white"
          disabled={!product.inStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </MotionCard>
  );
};

export default ProductCard;