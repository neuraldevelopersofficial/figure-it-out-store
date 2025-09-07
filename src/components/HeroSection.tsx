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
        // Temporarily disable API call due to CORS issues
        // const response = await apiClient.get('/carousels/hero');
        // console.log('Hero carousel API response:', response);
        // if (response && response.success && response.carousel) {
        //   setHeroCarousel(response.carousel);
        // } else {
          console.log('Using fallback carousel (API disabled due to CORS)');
          // Fallback to default slides if API fails
          setHeroCarousel({
            id: "fallback",
            name: "hero",
            title: "Hero Carousel",
            slides: [
              {
                id: "1",
                image: "/banners/homepage1.jpg?v=2025-01-07-5",
                title: "",
                subtitle: "",
                ctaText: "",
                ctaLink: "",
                overlay: false,
                order: 1
              },
              {
                id: "2", 
                image: "/banners/homepage2.jpg?v=2025-01-07-5",
                title: "",
                subtitle: "",
                ctaText: "",
                ctaLink: "",
                overlay: false,
                order: 2
              },
              {
                id: "3",
                image: "/banners/homepage3.jpg?v=2025-01-07-5", 
                title: "",
                subtitle: "",
                ctaText: "",
                ctaLink: "",
                overlay: false,
                order: 3
              },
              {
                id: "4",
                image: "/banners/homepage4.jpg?v=2025-01-07-5",
                title: "",
                subtitle: "",
                ctaText: "",
                ctaLink: "",
                overlay: false,
                order: 4
              },
              {
                id: "5",
                image: "/banners/homepage5.jpg?v=2025-01-07-5",
                title: "",
                subtitle: "",
                ctaText: "",
                ctaLink: "",
                overlay: false,
                order: 5
              },
              {
                id: "6",
                image: "/banners/homepage6.jpg?v=2025-01-07-5",
                title: "",
                subtitle: "",
                ctaText: "",
                ctaLink: "",
                overlay: false,
                order: 6
              },
              {
                id: "7",
                image: "/banners/homepage7.jpg?v=2025-01-07-5",
                title: "",
                subtitle: "",
                ctaText: "",
                ctaLink: "",
                overlay: false,
                order: 7
              },
              {
                id: "8",
                image: "/banners/homepage8.jpg?v=2025-01-07-5",
                title: "",
                subtitle: "",
                ctaText: "",
                ctaLink: "",
                overlay: false,
                order: 8
              },
              {
                id: "9",
                image: "/banners/homepage9.jpg?v=2025-01-07-5",
                title: "",
                subtitle: "",
                ctaText: "",
                ctaLink: "",
                overlay: false,
                order: 9
              },
              {
                id: "10",
                image: "/banners/homepage10.jpg?v=2025-01-07-5",
                title: "",
                subtitle: "",
                ctaText: "",
                ctaLink: "",
                overlay: false,
                order: 10
              },
              {
                id: "11",
                image: "/banners/homepage11.jpg?v=2025-01-07-5",
                title: "",
                subtitle: "",
                ctaText: "",
                ctaLink: "",
                overlay: false,
                order: 11
              }
            ],
            autoPlay: true,
            interval: 4000,
            height: "h-[80vh]",
            isActive: true
          });
        // }
      // } catch (error) {
      //   console.error('Failed to fetch hero carousel:', error);
      //   console.log('Using fallback carousel due to error');
      //   // Fallback to default slides if API fails
      //   setHeroCarousel({
      //     id: "fallback",
      //     name: "hero",
      //     title: "Hero Carousel",
      //     slides: [
      //       {
      //         id: "1",
      //         image: "/banners/homepage1.jpg?v=2025-01-07-5",
      //         title: "",
      //         subtitle: "",
      //         ctaText: "",
      //         ctaLink: "",
      //         overlay: false,
      //         order: 1
      //       },
      //       {
      //         id: "2", 
      //         image: "/banners/homepage2.jpg?v=2025-01-07-5",
      //         title: "",
      //         subtitle: "",
      //         ctaText: "",
      //         ctaLink: "",
      //         overlay: false,
      //         order: 2
      //       },
      //       {
      //         id: "3",
      //         image: "/banners/homepage3.jpg?v=2025-01-07-5", 
      //         title: "",
      //         subtitle: "",
      //         ctaText: "",
      //         ctaLink: "",
      //         overlay: false,
      //         order: 3
      //       },
      //       {
      //         id: "4",
      //         image: "/banners/homepage4.jpg?v=2025-01-07-5",
      //         title: "",
      //         subtitle: "",
      //         ctaText: "",
      //         ctaLink: "",
      //         overlay: false,
      //         order: 4
      //       },
      //       {
      //         id: "5",
      //         image: "/banners/homepage5.jpg?v=2025-01-07-5",
      //         title: "",
      //         subtitle: "",
      //         ctaText: "",
      //         ctaLink: "",
      //         overlay: false,
      //         order: 5
      //       },
      //       {
      //         id: "6",
      //         image: "/banners/homepage6.jpg?v=2025-01-07-5",
      //         title: "",
      //         subtitle: "",
      //         ctaText: "",
      //         ctaLink: "",
      //         overlay: false,
      //         order: 6
      //       },
      //       {
      //         id: "7",
      //         image: "/banners/homepage7.jpg?v=2025-01-07-5",
      //         title: "",
      //         subtitle: "",
      //         ctaText: "",
      //         ctaLink: "",
      //         overlay: false,
      //         order: 7
      //       },
      //       {
      //         id: "8",
      //         image: "/banners/homepage8.jpg?v=2025-01-07-5",
      //         title: "",
      //         subtitle: "",
      //         ctaText: "",
      //         ctaLink: "",
      //         overlay: false,
      //         order: 8
      //       },
      //       {
      //         id: "9",
      //         image: "/banners/homepage9.jpg?v=2025-01-07-5",
      //         title: "",
      //         subtitle: "",
      //         ctaText: "",
      //         ctaLink: "",
      //         overlay: false,
      //         order: 9
      //       },
      //       {
      //         id: "10",
      //         image: "/banners/homepage10.jpg?v=2025-01-07-5",
      //         title: "",
      //         subtitle: "",
      //         ctaText: "",
      //         ctaLink: "",
      //         overlay: false,
      //         order: 10
      //       },
      //       {
      //         id: "11",
      //         image: "/banners/homepage11.jpg?v=2025-01-07-5",
      //         title: "",
      //         subtitle: "",
      //         ctaText: "",
      //         ctaLink: "",
      //         overlay: false,
      //         order: 11
      //       }
      //     ],
      //     autoPlay: true,
      //     interval: 4000,
      //     height: "h-[80vh]",
      //     isActive: true
      //   });
      // } finally {
        setLoading(false);
      // }
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
    console.log('HeroSection: No carousel data, returning null');
    return null;
  }

  console.log('HeroSection: Rendering carousel with', heroCarousel.slides?.length, 'slides');
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