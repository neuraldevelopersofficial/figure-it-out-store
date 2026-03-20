import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowDown, Loader2 } from "lucide-react";
import apiClient, { mapApiProducts } from "@/lib/api";
import { Product } from "@/context/StoreContext";
import ModernLoadingAnimation from "@/components/ui/modern-loading-animation";

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedCount, setDisplayedCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setInitialLoading(true);
        const resp = await apiClient.getProducts();
        if (resp && resp.success) {
          const all = mapApiProducts(resp.products);
          const featured = all.filter(p => p.isNew || p.isOnSale);
          setAllProducts(featured);
          setFeaturedProducts(featured.slice(0, 8));
        }
      } catch (e) {
        console.error('Failed to load featured products', e);
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  const handleLoadMore = async () => {
    setLoading(true);
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newCount = Math.min(displayedCount + 8, allProducts.length);
    setFeaturedProducts(allProducts.slice(0, newCount));
    setDisplayedCount(newCount);
    setLoading(false);
  };

  const hasMoreProducts = displayedCount < allProducts.length;

  if (initialLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our most popular and trending collectibles. From limited edition figures 
              to exclusive keychains, find your next favorite piece.
            </p>
          </div>
          
          {/* Modern Loading Animation */}
          <ModernLoadingAnimation 
            type="grid" 
            count={8} 
            message="Loading amazing products..."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Featured Products
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Discover our most popular and trending collectibles. From limited edition figures 
            to exclusive keychains, find your next favorite piece.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12 stagger-fade-in">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} delay={index} />
          ))}
        </div>

        {/* Load More Button */}
        {hasMoreProducts && (
          <div className="text-center">
            <Button 
              size="lg" 
              onClick={handleLoadMore}
              disabled={loading}
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-sm font-medium rounded-lg group transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Load More Products
                  <ArrowDown className="h-4 w-4 ml-2 group-hover:translate-y-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Show message when all products are loaded */}
        {!hasMoreProducts && allProducts.length > 0 && (
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              You've seen all {allProducts.length} featured products
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;