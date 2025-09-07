import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ShoppingCart, Truck, Shield, RotateCcw, ArrowLeft, Star, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/context/StoreContext";
import apiClient, { mapApiProduct, mapApiProducts } from "@/lib/api";
import { toCategorySlug, convertGoogleDriveUrl, getGoogleDriveProxyUrl } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FallbackImage } from "@/components/ui/fallback-image";
import LoadingState from "@/components/ui/LoadingState";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/ui/page-transition";
import ReviewSection from "@/components/ReviewSection";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Cache busting - force fresh deployment
  console.log('ProductDetail loaded - v2025-01-07-6 (Power score removed, Reviews added)');
  
  // Product state
  
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore();
  
  const [product, setProduct] = useState<any | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const isWishlisted = product ? isInWishlist(product.id) : false;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(true);
    setNotFound(false);
    
    (async () => {
      if (!id) {
        setIsLoading(false);
        setNotFound(true);
        return;
      }
      
      try {
        const resp = await apiClient.getProduct(id);
        if (resp && resp.success) {
          const mapped = mapApiProduct(resp.product);
          setProduct(mapped);
          // Load related by category
          if (mapped?.category) {
            const rel = await apiClient.getProductsByCategory(mapped.category);
            if (rel && rel.success) {
              const relMapped = mapApiProducts(rel.products).filter((p: any) => p.id !== mapped.id).slice(0, 4);
              setRelatedProducts(relMapped);
            }
          }
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (e) {
        console.error('Failed to load product', e);
        setProduct(null);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  if (isLoading) {
    return (
      <>
        <Header />
        <LoadingState message="Loading product details..." fullScreen={true} type="banner" />
        <Footer />
      </>
    );
  }
  
  if (notFound || !product) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = () => {
    const { toast } = useToast();
    
    // Check stock availability
    if (!product.inStock) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if requested quantity exceeds available stock
    if (product.stockQuantity && quantity > product.stockQuantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stockQuantity} items available. Please reduce quantity.`,
        variant: "destructive"
      });
      return;
    }
    
    // Add to cart with the selected quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    
    toast({
      title: "Added to Cart",
      description: `${quantity} x ${product.name} has been added to your cart.`,
      variant: "default"
    });
  };

  const handleBuyNow = () => {
    const { toast } = useToast();
    
    // Check stock availability
    if (!product.inStock) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if requested quantity exceeds available stock
    if (product.stockQuantity && quantity > product.stockQuantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stockQuantity} items available. Please reduce quantity.`,
        variant: "destructive"
      });
      return;
    }
    
    // Add to cart with the selected quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    
    toast({
      title: "Added to Cart",
      description: `${quantity} x ${product.name} has been added to your cart. Redirecting to checkout...`,
      variant: "default"
    });
    
    // Navigate to checkout after a short delay
    setTimeout(() => {
      window.location.href = '/checkout';
    }, 1000);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  // No review functionality in this version

  // Combine main image with additional images for the gallery
  const productImages = [product.image, ...(product.images || [])].filter(Boolean);

  return (
    <PageTransition className="min-h-screen bg-white">
      <Header />
      
      {/* Product Details - Compact Layout */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Product Images */}
          <div className="flex gap-4">
            {/* Thumbnail Images - Vertical Stack */}
            <div className="flex flex-col gap-2 w-20">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index 
                      ? 'border-black' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <FallbackImage
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    fallbackSrc="/placeholder-image.png"
                  />
                </button>
              ))}
            </div>
            
            {/* Main Image */}
            <div className="flex-1 aspect-square bg-gray-50 rounded-lg overflow-hidden">
              <FallbackImage
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                fallbackSrc="/placeholder-image.png"
              />
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-4">
            {/* Product Title */}
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-red-600">
                  ₹{product.price ? product.price.toLocaleString() : '0'}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    ₹{product.originalPrice ? product.originalPrice.toLocaleString() : '0'}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">Online Exclusive</p>
            </div>



            {/* Quantity Selector */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">Quantity:</p>
              <div className="relative w-20">
                <select 
                  value={quantity} 
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded text-sm appearance-none bg-white"
                  disabled={!product.inStock}
                >
                  {(() => {
                    const maxQuantity = product.stockQuantity ? Math.min(product.stockQuantity, 10) : 10;
                    const quantities = [];
                    for (let i = 1; i <= maxQuantity; i++) {
                      quantities.push(i);
                    }
                    return quantities.map(num => (
                      <option key={num} value={num}>{num}</option>
                    ));
                  })()}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
              {product.stockQuantity && (
                <p className="text-xs text-gray-500">
                  {product.stockQuantity} items available
                </p>
              )}
            </div>

            {/* Buy Now and Add to Cart Buttons */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 bg-black hover:bg-red-600 active:bg-red-700 text-white font-semibold py-3 text-sm sm:text-base transition-all duration-300 hover:scale-105 active:scale-95 transform"
                disabled={!product.inStock}
                onClick={handleBuyNow}
              >
                BUY NOW
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-black hover:bg-red-600 active:bg-red-700 text-white font-semibold py-3 text-sm sm:text-base transition-all duration-300 hover:scale-105 active:scale-95 transform"
                disabled={!product.inStock}
                onClick={handleAddToCart}
              >
                ADD TO CART
              </Button>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                {product.inStock 
                  ? (product.stockQuantity 
                      ? `${product.stockQuantity} in Stock` 
                      : 'In Stock')
                  : 'Out of Stock'
                }
              </span>
            </div>

            {/* Features */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="h-4 w-4" />
                <span>Free shipping on orders above ₹999</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Authentic product guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <RotateCcw className="h-4 w-4" />
                <span>Easy returns within 7 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <ReviewSection productId={product.id} />
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              You might also like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </section>
      )}
      <Footer />
    </PageTransition>
  );
};

export default ProductDetail;
