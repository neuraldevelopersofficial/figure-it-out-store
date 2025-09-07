import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Carousel from "./Carousel";
import { apiClient } from "@/lib/api";
import ModernLoadingAnimation from "@/components/ui/modern-loading-animation";

interface Slide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  overlay: boolean;
  order: number;
}

interface CarouselData {
  id: string;
  name: string;
  title: string;
  slides: Slide[];
  autoPlay: boolean;
  interval: number;
  height: string;
  isActive: boolean;
}

const HeroSection = () => {
  const [heroCarousel, setHeroCarousel] = useState<CarouselData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroCarousel = async () => {
      try {
        const response = await apiClient.get('/carousels/hero');
        if (response.success) {
          setHeroCarousel(response.carousel);
        }
      } catch (error) {
        console.error('Failed to fetch hero carousel:', error);
        // Fallback to default slides if API fails
        setHeroCarousel({
          id: "fallback",
          name: "hero",
          title: "Hero Carousel",
          slides: [
            {
              id: "1",
              image: "/hero-figures.jpg",
              title: "Discover Amazing Anime Collectibles",
              subtitle: "From iconic figures to unique keychains, find your perfect piece",
              ctaText: "Shop Now",
              ctaLink: "#featured-collection",
              overlay: true,
              order: 1
            },
            {
              id: "2", 
              image: "/anime-banner2.jpeg",
              title: "Premium Quality Figures",
              subtitle: "Handcrafted with attention to every detail",
              ctaText: "Explore Anime Figures",
              ctaLink: "/anime-figures",
              overlay: true,
              order: 2
            },
            {
              id: "3",
              image: "/keychain-slide1.jpg", 
              title: "Express Your Fandom",
              subtitle: "Show off your love for anime with our exclusive collection",
              ctaText: "Browse Keychains",
              ctaLink: "/keychains",
              overlay: true,
              order: 3
            }
          ],
          autoPlay: true,
          interval: 6000,
          height: "h-[600px]",
          isActive: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHeroCarousel();
  }, []);

  if (loading) {
    return (
      <section className="relative">
        <div className="h-[600px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden flex items-center justify-center">
          {/* Modern Loading Animation */}
          <ModernLoadingAnimation 
            type="banner" 
            count={1} 
            message="Loading amazing content..."
            className="text-white"
          />
        </div>
      </section>
    );
  }

  if (!heroCarousel) {
    return null;
  }

  return (
    <section className="relative">
      {/* Hero Carousel */}
      <Carousel 
        slides={heroCarousel.slides} 
        height={heroCarousel.height}
        autoPlay={heroCarousel.autoPlay}
        interval={heroCarousel.interval}
      />
      
      {/* Bottom Centered Action Buttons */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
        <Button 
          size="lg" 
          className="!bg-brand-red hover:bg-brand-red-dark text-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base w-full sm:w-auto"
          onClick={() => {
            const featuredSection = document.getElementById('featured-collection');
            if (featuredSection) {
              featuredSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          Shop Now
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          className="!bg-white/90 hover:bg-white text-foreground px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base w-full sm:w-auto"
          onClick={() => {
            const categoriesSection = document.getElementById('categories-section');
            if (categoriesSection) {
              categoriesSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          Explore Categories
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;