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
  const [itemsToShow, setItemsToShow] = useState(3);

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

  // Handle responsive items count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsToShow(1);
      } else if (window.innerWidth < 1024) {
        setItemsToShow(2);
      } else {
        setItemsToShow(3);
      }
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + itemsToShow) % keychainProducts.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - itemsToShow + keychainProducts.length) % keychainProducts.length);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4 max-w-full">
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
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 max-w-full">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            KEYCHAIN COLLECTION
          </h2>
        </div>

        {/* Keychain Showcase Carousel */}
        <div className="relative w-full max-w-6xl mx-auto overflow-hidden">
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full w-10 h-10 p-0"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full w-10 h-10 p-0"
            onClick={nextSlide}
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </Button>

          {/* Main Showcase Container */}
          <div className="relative px-8 sm:px-12">
            <div className="flex justify-center items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {/* Display responsive number of keychains */}
              {keychainProducts.slice(currentIndex, currentIndex + itemsToShow).map((product, index) => (
                <div key={product.id} className="relative group flex-shrink-0">
                  <Link to={`/product/${product.id}`} className="block">
                    {/* Responsive Image Card */}
                    <div className="relative w-64 sm:w-72 md:w-80 lg:w-96 bg-white rounded-2xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-1" style={{aspectRatio: '16/9'}}>
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
            {Array.from({ length: Math.ceil(keychainProducts.length / itemsToShow) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * itemsToShow)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / itemsToShow) === index
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
