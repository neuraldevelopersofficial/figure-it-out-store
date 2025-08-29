import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

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
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              {slide.overlay && (
                <div className="absolute inset-0 bg-black/40" />
              )}
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center h-full text-center text-white">
              <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-4xl md:text-6xl font-bold mb-4">
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className="text-xl md:text-2xl mb-8 text-gray-200">
                    {slide.subtitle}
                  </p>
                )}
                {slide.ctaText && slide.ctaLink && (
                  <Button 
                    size="lg" 
                    className="bg-brand-red hover:bg-brand-red-dark text-white text-lg px-8 py-3"
                    asChild
                  >
                    <Link to={slide.ctaLink}>
                      {slide.ctaText}
                    </Link>
                  </Button>
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
