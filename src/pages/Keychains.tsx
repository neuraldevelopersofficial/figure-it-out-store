import { useState, useEffect } from "react";
import { Grid3X3, List, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/ProductCard";
import apiClient, { mapApiProducts } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Carousel from "@/components/Carousel";

const Keychains = () => {
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [allKeychains, setAllKeychains] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const resp = await apiClient.getProductsByCategory('Keychains');
        if (resp && resp.success) {
          setAllKeychains(mapApiProducts(resp.products));
        }
      } catch (e) {
        console.error('Failed to load keychains', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  
  // Carousel slides for Keychains page
  const keychainSlides = [
    {
      id: "1",
      image: "/banners/keychain1.jpg?v=2025-01-07",
      title: "Anime Keychains",
      subtitle: "Express your fandom with unique accessories",
      ctaText: "Shop All Keychains",
      ctaLink: "#products-grid",
      overlay: true
    },
    {
      id: "2",
      image: "/banners/keychain2.jpg?v=2025-01-07",
      title: "Limited Edition Designs",
      subtitle: "Exclusive keychains from your favorite series",
      ctaText: "View Limited Editions",
      ctaLink: "#products-grid",
      overlay: true
    }
  ];
  
  // Filter and sort products
  let filteredProducts = [...allKeychains];
  
  // Apply search filter
  if (searchQuery) {
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // Apply price filter
  if (priceRange !== "all") {
    filteredProducts = filteredProducts.filter(product => {
      switch (priceRange) {
        case "under-500":
          return product.price < 500;
        case "500-1000":
          return product.price >= 500 && product.price < 1000;
        case "above-1000":
          return product.price >= 1000;
        default:
          return true;
      }
    });
  }
  
  // Apply sorting
  switch (sortBy) {
    case "price-low":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      filteredProducts.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      filteredProducts.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
    default:
      // Featured - keep original order
      break;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Carousel */}
      <section className="mb-8">
        <Carousel 
          slides={keychainSlides} 
          height="h-[500px]"
          autoPlay={true}
          interval={4000}
        />
      </section>

      {/* Filters and Search */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Input
                placeholder="Search keychains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
              {/* Price Range */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-500">Under ₹500</SelectItem>
                  <SelectItem value="500-1000">₹500 - ₹1,000</SelectItem>
                  <SelectItem value="above-1000">Above ₹1,000</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border border-border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section id="products-grid" className="py-12">
        <div className="container mx-auto px-4">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-muted-foreground">
              Showing {filteredProducts.length} of {allKeychains.length} keychains
            </div>
            {searchQuery && (
              <Badge variant="secondary" className="text-sm">
                Search: "{searchQuery}"
              </Badge>
            )}
          </div>

          {/* Products Grid/List */}
          {loading ? (
            <div className="text-center py-16">
              <div className="relative">
                {/* Main loading circle */}
                <div className="w-12 h-12 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
                
                {/* Floating particles */}
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-xl text-gray-500">Loading keychains...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  showQuickView={viewMode === "grid"}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔑</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No keychains found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery("");
                  setPriceRange("all");
                  setSortBy("featured");
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Keychains;
