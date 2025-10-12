import { useState, useEffect } from "react";
import { Filter, Grid3X3, List, Star, ShoppingCart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/ProductCard";
import apiClient, { mapApiProducts } from "@/lib/api";
import { Product } from "@/context/StoreContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Carousel from "@/components/Carousel";
import LoadingState from "@/components/ui/LoadingState";

const AnimeFigures = () => {
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [allFigures, setAllFigures] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [animeFigureCarousel, setAnimeFigureCarousel] = useState<any>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    (async () => {
      try {
        // Fetch anime figures products
        const resp = await apiClient.getProductsByCategory('Anime Figures');
        if (resp && resp.success) {
          setAllFigures(mapApiProducts(resp.products));
        }

        // Fetch anime figures carousel
        try {
          console.log('Fetching anime figures carousel from API...');
          const carouselResponse = await apiClient.get(`/carousels/anime-figures?t=${Date.now()}`);
          console.log('Anime figures carousel API response:', carouselResponse);
          if (carouselResponse && carouselResponse.success && carouselResponse.carousel) {
            console.log('✅ Using API anime figures carousel data');
            setAnimeFigureCarousel(carouselResponse.carousel);
          } else {
            console.log('⚠️ API response invalid, using fallback carousel');
            // Fallback to default slides if API fails
            setAnimeFigureCarousel({
              id: "fallback",
              name: "anime-figures",
              title: "Anime Figures Carousel",
              slides: [
                {
                  id: "1",
                  image: "/banners/figurine1.jpg?v=2025-01-07-5",
                  title: "",
                  subtitle: "",
                  ctaText: "",
                  ctaLink: "",
                  overlay: false,
                  order: 1
                },
                {
                  id: "2",
                  image: "/banners/figurine2.jpg?v=2025-01-07-5",
                  title: "",
                  subtitle: "",
                  ctaText: "",
                  ctaLink: "",
                  overlay: false,
                  order: 2
                },
                {
                  id: "3",
                  image: "/banners/figurine3.jpg?v=2025-01-07-5",
                  title: "",
                  subtitle: "",
                  ctaText: "",
                  ctaLink: "",
                  overlay: false,
                  order: 3
                }
              ]
            });
          }
        } catch (error) {
          console.error('Failed to fetch anime figures carousel:', error);
          console.log('Using fallback carousel due to error');
          // Fallback to default slides if API fails
          setAnimeFigureCarousel({
            id: "fallback",
            name: "anime-figures",
            title: "Anime Figures Carousel",
            slides: [
              {
                id: "1",
                image: "/banners/figurine1.jpg?v=2025-01-07-5",
                title: "",
                subtitle: "",
                ctaText: "",
                ctaLink: "",
                overlay: false,
                order: 1
              },
              {
                id: "2",
                image: "/banners/figurine2.jpg?v=2025-01-07-5",
                title: "",
                subtitle: "",
                ctaText: "",
                ctaLink: "",
                overlay: false,
                order: 2
              },
              {
                id: "3",
                image: "/banners/figurine3.jpg?v=2025-01-07-5",
                title: "",
                subtitle: "",
                ctaText: "",
                ctaLink: "",
                overlay: false,
                order: 3
              }
            ]
          });
        }
      } catch (e) {
        console.error('Failed to load anime figures', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Refresh carousel data
  const refreshCarousel = async () => {
    setRefreshing(true);
    try {
      console.log('Refreshing anime figures carousel...');
      const carouselResponse = await apiClient.get(`/carousels/anime-figures?t=${Date.now()}`);
      console.log('Refreshed anime figures carousel response:', carouselResponse);
      if (carouselResponse && carouselResponse.success && carouselResponse.carousel) {
        console.log('✅ Using refreshed anime figures carousel data');
        setAnimeFigureCarousel(carouselResponse.carousel);
      }
    } catch (error) {
      console.error('Failed to refresh anime figures carousel:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Refresh on page focus
  useEffect(() => {
    const handleFocus = () => {
      refreshCarousel();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
  
  // Use dynamic carousel data or fallback
  const animeFigureSlides = animeFigureCarousel?.slides || [];
  
  // Filter and sort products
  let filteredProducts = [...allFigures];
  
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
        case "under-1000":
          return product.price < 1000;
        case "1000-2000":
          return product.price >= 1000 && product.price < 2000;
        case "2000-3000":
          return product.price >= 2000 && product.price < 3000;
        case "above-3000":
          return product.price >= 3000;
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
  
  // Render loading state if data is being fetched
  const renderProductsSection = () => {
    if (isLoading) {
      return <LoadingState message="Loading anime figures..." type="grid" count={8} />;
    }
    
    if (filteredProducts.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No figures found
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
      );
    }
    
    return (
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
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Carousel */}
      <section className="mb-8 relative">
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshCarousel}
            disabled={refreshing}
            className="bg-white/90 hover:bg-white shadow-lg"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        <Carousel 
          slides={animeFigureSlides} 
          height="h-[70vh]"
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
                placeholder="Search anime figures..."
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
                  <SelectItem value="under-1000">Under ₹1,000</SelectItem>
                  <SelectItem value="1000-2000">₹1,000 - ₹2,000</SelectItem>
                  <SelectItem value="2000-3000">₹2,000 - ₹3,000</SelectItem>
                  <SelectItem value="above-3000">Above ₹3,000</SelectItem>
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
              Showing {filteredProducts.length} of {allFigures.length} anime figures
            </div>
            {searchQuery && (
              <Badge variant="secondary" className="text-sm">
                Search: "{searchQuery}"
              </Badge>
            )}
          </div>

          {/* Products Grid/List */}
          {renderProductsSection()}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AnimeFigures;
