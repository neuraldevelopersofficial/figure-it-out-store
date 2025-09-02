import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ShoppingCart, Truck, Shield, RotateCcw, ArrowLeft } from "lucide-react";
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

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Review system state
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState([
    {
      rating: 5,
      title: "Amazing Quality!",
      text: "This figure exceeded my expectations. The details are incredible and the paint job is perfect.",
      author: "AnimeFan123",
      date: "2024-01-15"
    },
    {
      rating: 4,
      title: "Great Product",
      text: "Really happy with this purchase. Good value for money and fast delivery.",
      author: "Collector456",
      date: "2024-01-10"
    }
  ]);
  
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
        <LoadingState message="Loading product details..." fullScreen={true} />
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
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
      variant: "default"
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewText.trim()) {
      alert('Please fill in all fields');
      return;
    }
    
    const newReview = {
      rating,
      title: reviewTitle.trim(),
      text: reviewText.trim(),
      author: 'Anonymous User', // In real app, this would be the logged-in user
      date: new Date().toISOString().split('T')[0]
    };
    
    setReviews([newReview, ...reviews]);
    setReviewTitle('');
    setReviewText('');
    setRating(5);
    
    alert('Review submitted successfully!');
  };

  // Combine main image with additional images for the gallery
  const productImages = [product.image, ...(product.images || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to={`/${toCategorySlug(product.category)}`} className="hover:text-foreground">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <FallbackImage
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                fallbackSrc="/placeholder-image.png"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex gap-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index 
                      ? 'border-brand-red' 
                      : 'border-border hover:border-brand-red/50'
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
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category and Badges */}
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
              {product.isNew && (
                <Badge className="bg-green-500 text-white text-xs">
                  NEW
                </Badge>
              )}
              {product.isOnSale && (
                <Badge className="bg-brand-red text-white text-xs">
                  -{product.discount}% OFF
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {product.name}
            </h1>

            {/* Rating removed for first launch */}

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-foreground">
                  ₹{product.price ? product.price.toLocaleString() : '0'}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.originalPrice ? product.originalPrice.toLocaleString() : '0'}
                  </span>
                )}
              </div>
              {product.originalPrice && (
                <div className="text-sm text-green-600 font-medium">
                  You save ₹{product.originalPrice && product.price ? (product.originalPrice - product.price).toLocaleString() : '0'} 
                  ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%)
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={product.inStock ? 'text-green-600' : 'text-red-600'}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="font-medium text-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="px-3 py-1"
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 10}
                    className="px-3 py-1"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg border-2 border-blue-600"
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  onClick={handleWishlistToggle}
                  className={`px-6 font-semibold shadow-lg border-2 ${
                    isWishlisted 
                      ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600' 
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck className="h-4 w-4" />
                <span>Free shipping on orders above ₹999</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Authentic product guarantee</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
                <span>Easy returns within 7 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews and Ratings */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              Customer Reviews
            </h2>
            
            {/* Review Form */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="text-2xl text-yellow-400 hover:text-yellow-500 transition-colors"
                        onClick={() => setRating(star)}
                      >
                        {star <= rating ? '★' : '☆'}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Review Title</label>
                  <input
                    type="text"
                    placeholder="Summarize your experience"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Review</label>
                  <textarea
                    placeholder="Share your thoughts about this product..."
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                </div>
                
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSubmitReview}
                >
                  Submit Review
                </Button>
              </form>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <div key={index} className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star}>
                            {star <= review.rating ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="font-medium">{review.title}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.text}</p>
                  <p className="text-sm text-gray-500 mt-2">- {review.author}</p>
                </div>
              ))}
              
              {reviews.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
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
    </div>
  );
};

export default ProductDetail;
