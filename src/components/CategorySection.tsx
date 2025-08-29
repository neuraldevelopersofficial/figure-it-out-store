import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CategorySection = () => {
  const categories = [
    {
      id: "anime-figures",
      name: "Anime Figures",
      description: "Premium collectible figures from your favorite anime series",
      image: "🎭",
      count: "150+ Products",
      color: "from-blue-500 to-purple-600"
    },
    {
      id: "keychains",
      name: "Keychains",
      description: "Unique anime-themed keychains and accessories",
      image: "🔑",
      count: "200+ Products",
      color: "from-pink-500 to-red-500"
    },
    {
      id: "hot-wheels",
      name: "Hot Wheels",
      description: "Classic and limited edition car collectibles",
      image: "🏎️",
      count: "Coming Soon",
      color: "from-orange-500 to-yellow-500",
      disabled: true
    },
    {
      id: "trending",
      name: "Trending",
      description: "Latest and most popular items in the community",
      image: "🔥",
      count: "Coming Soon",
      color: "from-green-500 to-teal-500",
      disabled: true
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collections of anime collectibles, from premium figures 
            to unique accessories that showcase your fandom.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="group">
              {category.disabled ? (
                // Disabled category card
                <div className="relative bg-muted/50 border border-border rounded-xl p-6 text-center transition-all duration-300 cursor-not-allowed hover:bg-muted/70">
                  <div className="text-4xl mb-4 opacity-50">{category.image}</div>
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground/80 text-sm mb-4">
                    {category.description}
                  </p>
                  <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full inline-block">
                    {category.count}
                  </div>
                </div>
              ) : (
                // Active category card
                <Link to={`/${category.id}`}>
                  <div className="relative bg-card border border-border hover:border-brand-red rounded-xl p-6 text-center transition-all duration-300 group-hover:shadow-lg cursor-pointer">
                    <div className="text-4xl mb-4">{category.image}</div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-brand-red font-medium">
                      <span>{category.count}</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* View All Products */}
        <div className="text-center mt-12">
          <Link to="/products">
            <Button 
              size="lg" 
              variant="outline"
              className="border-brand-red text-brand-red hover:bg-brand-red hover:text-white px-8 py-3 text-lg group"
            >
              Explore All Products
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;