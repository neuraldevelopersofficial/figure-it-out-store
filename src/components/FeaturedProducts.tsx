import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import apiClient, { mapApiProducts } from "@/lib/api";
import { Product } from "@/context/StoreContext";

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiClient.getProducts();
        if (resp && resp.success) {
          const all = mapApiProducts(resp.products);
          const featured = all.filter(p => p.isNew || p.isOnSale).slice(0, 8);
          setFeaturedProducts(featured);
        }
      } catch (e) {
        console.error('Failed to load featured products', e);
      }
    })();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular and trending collectibles. From limited edition figures 
            to exclusive keychains, find your next favorite piece.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link to="/products">
            <Button 
              size="lg" 
              variant="outline"
              className="border-brand-red text-brand-red hover:bg-brand-red hover:text-white px-8 py-3 text-lg group"
            >
              View All Products
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;