import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import OptimizedImage from "@/components/ui/optimized-image";

interface CarouselSlide {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  overlay?: boolean;
}

interface CarouselProps {
  slides: CarouselSlide[];
  autoPlay?: boolean;
  interval?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
  height?: string;
}

const Carousel = ({ 
  slides, 
  autoPlay = true, 
  interval = 5000, 
  showIndicators = true, 
  showArrows = true,
  height = "h-96"
}: CarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);

  useEffect(() => {
    // Initialize images loaded state
    setImagesLoaded(new Array(slides.length).fill(false));
  }, [slides.length]);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  const handleImageLoad = (index: number) => {
    setImagesLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  if (!slides.length) return null;

  return (
    <div className={`relative w-full overflow-hidden ${height}`}>
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              {/* Loading state */}
              {!imagesLoaded[index] && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <div className="relative">
                    {/* Main loading circle */}
                    <div className="w-16 h-16 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                    
                    {/* Floating particles */}
                    <div className="absolute -top-2 -left-2 w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="absolute -top-2 -right-2 w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              
              <OptimizedImage
                src={slide.image}
                alt={slide.title}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  imagesLoaded[index] ? 'opacity-100' : 'opacity-0'
                }`}
                priority={index === 0} // First slide has priority
                lazy={index > 0} // Lazy load other slides
                placeholder="blur"
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageLoad(index)} // Also mark as loaded on error
              />
              {slide.overlay && (
                <div className="absolute inset-0 bg-black/40" />
              )}
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center h-full text-center text-white">
              <div className="max-w-4xl mx-auto px-4">
                <h2 className={`text-4xl md:text-6xl font-bold mb-4 transition-all duration-700 ${
                  imagesLoaded[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className={`text-xl md:text-2xl mb-8 text-gray-200 transition-all duration-700 delay-200 ${
                    imagesLoaded[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}>
                    {slide.subtitle}
                  </p>
                )}
                {slide.ctaText && slide.ctaLink && (
                  <div className={`transition-all duration-700 delay-400 ${
                    imagesLoaded[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}>
                    <Button 
                      size="lg" 
                      className="bg-brand-red hover:bg-brand-red-dark text-white text-lg px-8 py-3"
                      asChild
                    >
                      <Link to={slide.ctaLink}>
                        {slide.ctaText}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full h-12 w-12 p-0"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full h-12 w-12 p-0"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide
                  ? "bg-white"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
