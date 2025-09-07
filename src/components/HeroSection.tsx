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
              image: "/banners/homepage1.jpg?v=2025-01-07",
              title: "Discover Amazing Anime Collectibles",
              subtitle: "From iconic figures to unique keychains, find your perfect piece",
              ctaText: "Shop Now",
              ctaLink: "#featured-collection",
              overlay: true,
              order: 1
            },
            {
              id: "2", 
              image: "/banners/homepage2.jpg?v=2025-01-07",
              title: "Premium Quality Figures",
              subtitle: "Handcrafted with attention to every detail",
              ctaText: "Explore Anime Figures",
              ctaLink: "/anime-figures",
              overlay: true,
              order: 2
            },
            {
              id: "3",
              image: "/banners/homepage3.jpg?v=2025-01-07", 
              title: "Express Your Fandom",
              subtitle: "Show off your love for anime with our exclusive collection",
              ctaText: "Browse Keychains",
              ctaLink: "/keychains",
              overlay: true,
              order: 3
            },
            {
              id: "4",
              image: "/banners/homepage4.jpg?v=2025-01-07",
              title: "Exclusive Collections",
              subtitle: "Limited edition items you won't find anywhere else",
              ctaText: "View Collections",
              ctaLink: "/all-products",
              overlay: true,
              order: 4
            },
            {
              id: "5",
              image: "/banners/homepage5.jpg?v=2025-01-07",
              title: "New Arrivals Weekly",
              subtitle: "Fresh additions to our collection every week",
              ctaText: "See What's New",
              ctaLink: "/all-products",
              overlay: true,
              order: 5
            },
            {
              id: "6",
              image: "/banners/homepage6.jpg?v=2025-01-07",
              title: "Anime Merchandise",
              subtitle: "From your favorite series to hidden gems",
              ctaText: "Explore All",
              ctaLink: "/all-products",
              overlay: true,
              order: 6
            },
            {
              id: "7",
              image: "/banners/homepage7.jpg?v=2025-01-07",
              title: "Collector's Paradise",
              subtitle: "Find rare and exclusive anime collectibles",
              ctaText: "Start Collecting",
              ctaLink: "/anime-figures",
              overlay: true,
              order: 7
            },
            {
              id: "8",
              image: "/banners/homepage8.jpg?v=2025-01-07",
              title: "Perfect Gifts",
              subtitle: "Find the ideal present for anime lovers",
              ctaText: "Shop Gifts",
              ctaLink: "/all-products",
              overlay: true,
              order: 8
            },
            {
              id: "9",
              image: "/banners/homepage9.jpg?v=2025-01-07",
              title: "Fan Favorites",
              subtitle: "Most loved items from our community",
              ctaText: "View Favorites",
              ctaLink: "/all-products",
              overlay: true,
              order: 9
            },
            {
              id: "10",
              image: "/banners/homepage10.jpg?v=2025-01-07",
              title: "Quality Guaranteed",
              subtitle: "Premium materials and authentic designs",
              ctaText: "Learn More",
              ctaLink: "/about",
              overlay: true,
              order: 10
            },
            {
              id: "11",
              image: "/banners/homepage11.jpg?v=2025-01-07",
              title: "Join Our Community",
              subtitle: "Connect with fellow anime enthusiasts",
              ctaText: "Get Started",
              ctaLink: "/signup",
              overlay: true,
              order: 11
            }
          ],
          autoPlay: true,
          interval: 4000,
          height: "h-screen",
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