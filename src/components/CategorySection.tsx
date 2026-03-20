import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

const CategorySection = () => {
  const categories = [
    {
      id: "anime-figures",
      name: "Anime Figures",
      description: "Premium collectible figures",
      icon: Sparkles,
      gradient: "from-blue-500 to-purple-600"
    },
    {
      id: "keychains",
      name: "Keychains",
      description: "Unique anime accessories",
      icon: Zap,
      gradient: "from-pink-500 to-red-500"
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Discover our curated collections of premium anime collectibles
          </p>
        </div>

        {/* Categories Grid - Minimal Design */}
        <div className="flex justify-center gap-8 mb-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link key={category.id} to={`/${category.id}`} className="group">
                <div className="relative bg-white border border-gray-200 rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer min-w-[200px]">
                  {/* Icon with gradient background */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${category.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Category name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4">
                    {category.description}
                  </p>
                  
                  {/* Arrow indicator */}
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-gray-500" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Products - Minimal Button */}
        <div className="text-center">
          <Link to="/products">
            <Button 
              size="lg" 
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-sm font-medium rounded-lg group transition-all duration-200"
            >
              View All Products
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;