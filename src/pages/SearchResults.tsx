import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Grid3X3, List, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/ProductCard";
import apiClient, { mapApiProducts } from "@/lib/api";
import { Product } from "@/context/StoreContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      if (query) {
        try {
          const resp = await apiClient.searchProducts(query);
          if (resp && resp.success) {
            setSearchResults(mapApiProducts(resp.products));
          }
        } catch (e) {
          console.error('Search failed', e);
        }
      } else {
        setSearchResults([]);
      }
    })();
  }, [query]);

  // Filter and sort results
  let filteredResults = [...searchResults];
  
  // Apply price filter
  if (priceRange !== "all") {
    filteredResults = filteredResults.filter(product => {
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
      filteredResults.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      filteredResults.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      filteredResults.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      filteredResults.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
    default:
      // Featured - keep original order
      break;
  }

  if (!query) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Header />
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-foreground mb-4">No Search Query</h1>
          <p className="text-muted-foreground mb-6">
            Please enter a search term to find products.
          </p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
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
                ← Back to Shop
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Search Results</h1>
            <Badge variant="secondary" className="ml-2">
              {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Query Display */}
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg text-foreground">
                Results for "<span className="font-semibold">{query}</span>"
              </span>
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
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-muted-foreground">
              Showing {filteredResults.length} of {searchResults.length} results for "{query}"
            </div>
            {priceRange !== "all" && (
              <Badge variant="secondary" className="text-sm">
                Price: {priceRange.replace('-', ' - ')}
              </Badge>
            )}
          </div>

          {/* Products Grid/List */}
          {filteredResults.length > 0 ? (
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {filteredResults.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  showQuickView={viewMode === "grid"}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No results found for "{query}"
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => {
                    setPriceRange("all");
                    setSortBy("featured");
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
                <Link to="/">
                  <Button>
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default SearchResults;
