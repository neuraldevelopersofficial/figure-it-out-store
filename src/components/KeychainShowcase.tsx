import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient, { mapApiProducts } from "@/lib/api";
import { Product } from "@/context/StoreContext";
import OptimizedImage from "@/components/ui/optimized-image";
import ModernLoadingAnimation from "@/components/ui/modern-loading-animation";

const KeychainShowcase = () => {
  const [keychainProducts, setKeychainProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKeychains = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getProductsByCategory('Keychains');
        if (response && response.success) {
          const products = mapApiProducts(response.products);
          
          // Filter products that have valid images
          const productsWithImages = products.filter(product => 
            product.image && 
            product.image.trim() !== '' && 
            product.image !== 'null' && 
            product.image !== 'undefined'
          );
          
          // Shuffle the array randomly
          const shuffledProducts = productsWithImages.sort(() => Math.random() - 0.5);
          
          setKeychainProducts(shuffledProducts);
        }
      } catch (error) {
        console.error('Failed to fetch keychains:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKeychains();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % keychainProducts.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + keychainProducts.length) % keychainProducts.length);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                KEYCHAIN COLLECTION
              </h2>
              {/* Animated underline */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-red-500 to-purple-500 animate-pulse"></div>
            </div>
          </div>
          
          {/* Modern Loading Animation */}
          <div className="relative max-w-6xl mx-auto">
            <ModernLoadingAnimation 
              type="card" 
              count={3} 
              message="Loading amazing keychains..."
            />
          </div>
        </div>
      </section>
    );
  }

  if (keychainProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            KEYCHAIN COLLECTION
          </h2>
        </div>

        {/* Keychain Showcase Carousel */}
        <div className="relative max-w-7xl mx-auto">
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0"
            onClick={nextSlide}
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
          </Button>

          {/* Main Showcase Container */}
          <div className="relative px-4 sm:px-8 lg:px-16">
            <div className="flex justify-center items-center space-x-4 sm:space-x-6 md:space-x-8 lg:space-x-12">
              {/* Display 3 keychains at a time with distant spacing */}
              {keychainProducts.slice(currentIndex, currentIndex + 3).map((product, index) => (
                <div key={product.id} className="relative group flex-shrink-0">
                  <Link to={`/product/${product.id}`} className="block">
                    {/* Rectangular Image Card with Rounded Corners */}
                    <div className="relative w-80 sm:w-96 md:w-[28rem] lg:w-[32rem] bg-white rounded-3xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2" style={{aspectRatio: '16/9'}}>
                      <OptimizedImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        fallbackSrc="/placeholder-image.png"
                        lazy={true}
                        priority={false}
                        placeholder="blur"
                        style={{objectFit: 'cover', objectPosition: 'center'}}
                      />
                      {/* Overlay gradient for better text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: Math.ceil(keychainProducts.length / 3) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * 3)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / 3) === index
                    ? 'bg-red-500 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default KeychainShowcase;
