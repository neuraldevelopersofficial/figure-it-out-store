import { useState, useEffect, useRef } from "react";
import { Heart, ShoppingCart, Eye, Zap, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "@/context/StoreContext";
import { Product } from "@/context/StoreContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { convertGoogleDriveUrl, getGoogleDriveProxyUrl } from "@/lib/utils";
import OptimizedImage from "@/components/ui/optimized-image";
import { MotionCard } from "@/components/ui/motion-card";

interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
  delay?: number;
}

const ProductCard = ({ product, showQuickView = true, delay = 0 }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [wishlistAnimation, setWishlistAnimation] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isWishlisted = isInWishlist(product.id);

  // Combine all images for cycling (same as ProductDetail page)
  const allImages = [product.image, ...(product.images || [])].filter(Boolean);
  
  // Debug: Log the images being used
  console.log(`Product ${product.id} (${product.name}):`, {
    mainImage: product.image,
    additionalImages: product.images,
    allImages: allImages,
    currentIndex: currentImageIndex,
    currentImageSrc: allImages[currentImageIndex]
  });


  // Handle image cycling with useEffect - Auto cycle continuously
  useEffect(() => {
    if (allImages.length > 1) {
      console.log(`Starting auto image cycling for product ${product.id} with ${allImages.length} images`);
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex(prev => {
          const next = (prev + 1) % allImages.length;
          console.log(`Auto cycling: ${prev} -> ${next} for product ${product.id}, image: ${allImages[next]}`);
          return next;
        });
      }, 2000); // Change image every 2 seconds
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        console.log(`Stopping auto image cycling for product ${product.id}`);
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [allImages.length, product.id]);

  // Manual image navigation functions
  const goToPreviousImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`🔄 Previous arrow clicked for product ${product.id}`);
    setCurrentImageIndex(prev => {
      const next = (prev - 1 + allImages.length) % allImages.length;
      console.log(`Manual navigation: ${prev} -> ${next} for product ${product.id}, image: ${allImages[next]}`);
      return next;
    });
  };

  const goToNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`🔄 Next arrow clicked for product ${product.id}`);
    setCurrentImageIndex(prev => {
      const next = (prev + 1) % allImages.length;
      console.log(`Manual navigation: ${prev} -> ${next} for product ${product.id}, image: ${allImages[next]}`);
      return next;
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Trigger animation
    setWishlistAnimation(true);
    setTimeout(() => setWishlistAnimation(false), 600);
    
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

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to make a purchase.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (!product.inStock) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock.",
        variant: "destructive"
      });
      return;
    }

    // Add to cart first, then navigate to checkout
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart. Redirecting to checkout...`,
    });
    
    // Navigate to checkout after a short delay
    setTimeout(() => {
      navigate('/checkout');
    }, 1000);
  };

  return (
    <MotionCard
      delay={delay}
      className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:border-red-500 hover:shadow-red-500/20 sm:hover:scale-105 sm:hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Red glow gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg -z-10"></div>
      {/* Image Container - Nike style with colored background */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <Link 
          to={`/product/${product.id}`} 
          className="block h-full relative z-20"
          onClick={(e) => {
            console.log(`Navigating to product detail page for product ${product.id}`);
          }}
        >
          <OptimizedImage
            src={allImages[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500 cursor-pointer"
            fallbackSrc="/placeholder-image.png"
            lazy={true}
            priority={false}
            placeholder="blur"
            debug={true}
            onLoad={() => console.log(`✅ Image loaded successfully: ${allImages[currentImageIndex]} for product ${product.id}`)}
            onError={() => console.log(`❌ Image failed to load: ${allImages[currentImageIndex]} for product ${product.id}`)}
          />
        </Link>
        
        {/* Image carousel indicators - Dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-30">
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex gap-2">
              {allImages.map((_, index) => (
                <div 
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`h-2 w-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentImageIndex === index 
                      ? 'bg-red-500 scale-125 shadow-lg' 
                      : 'bg-white/90 hover:bg-white hover:scale-110'
                  }`}
                  title={`Image ${index + 1} of ${allImages.length}`}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Cycling indicator */}
        {allImages.length > 1 && isHovered && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
            {currentImageIndex + 1}/{allImages.length}
          </div>
        )}
        
        {/* Image navigation arrows */}
        {allImages.length > 1 && (
          <>
            {/* Previous arrow */}
            <Button
              onClick={goToPreviousImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/70 hover:bg-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 shadow-lg"
              size="sm"
              title="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Next arrow */}
            <Button
              onClick={goToNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/70 hover:bg-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 shadow-lg"
              size="sm"
              title="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Wishlist Button - Top right corner */}
        <Button
          size="sm"
          variant="ghost"
          className={`absolute top-2 right-2 h-9 w-9 p-0 rounded-full transition-all duration-200 shadow-lg z-40 ${
            isWishlisted 
              ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/50' 
              : 'bg-white/95 text-gray-600 hover:bg-white hover:text-red-500 shadow-gray-400/60'
          } ${
            wishlistAnimation ? 'wishlist-pop-animation' : ''
          }`}
          onClick={handleWishlistToggle}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`h-5 w-5 transition-all duration-200 ${
            isWishlisted ? 'fill-current' : ''
          }`} />
        </Button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <Badge className="bg-green-500 text-white text-xs font-semibold">
              NEW
            </Badge>
          )}
          {product.isOnSale && (
            <Badge className="bg-red-500 text-white text-xs font-semibold">
              -{product.discount}%
            </Badge>
          )}
        </div>
      </div>

      {/* Content - Nike style layout */}
      <div className="p-3 sm:p-4 bg-white">
        {/* Product Name */}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 truncate hover:text-blue-600 transition-colors text-sm sm:text-base">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base sm:text-lg font-bold text-gray-900">
            ₹{product.price ? product.price.toLocaleString() : '0'}
          </span>
          {product.originalPrice && (
            <span className="text-xs sm:text-sm text-gray-500 line-through">
              ₹{product.originalPrice ? product.originalPrice.toLocaleString() : '0'}
            </span>
          )}
        </div>

        {/* Power Score Bar */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">Power Score</span>
            <span className="text-xs text-gray-500 font-medium">
              {product.powerPoints || 50}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${((product.powerPoints || 50) / 100) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Stock Status */}
        {!product.inStock && (
          <div className="text-sm text-red-500 font-medium mb-3">
            Out of Stock
          </div>
        )}

        {/* Buy Now Button - Nike style with red hover animation */}
        <Button
          className="w-full bg-black hover:bg-red-600 active:bg-red-700 text-white font-semibold rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 text-xs sm:text-sm py-2 sm:py-2.5 hover:scale-105 active:scale-95 transform"
          disabled={!product.inStock}
          onClick={handleBuyNow}
        >
          {product.inStock ? 'Buy Now' : 'Out of Stock'}
        </Button>
      </div>
    </MotionCard>
  );
};

export default ProductCard;