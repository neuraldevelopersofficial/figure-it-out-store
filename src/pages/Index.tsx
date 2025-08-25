import { useState, useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";
import Carousel from "@/components/Carousel";
import { apiClient } from "@/lib/api";

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

const Index = () => {
  const [promoCarousel, setPromoCarousel] = useState<CarouselData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromoCarousel = async () => {
      try {
        const response = await apiClient.get('/carousels/promo');
        if (response.success) {
          setPromoCarousel(response.carousel);
        }
      } catch (error) {
        console.error('Failed to fetch promo carousel:', error);
        // Fallback to default slides if API fails
        setPromoCarousel({
          id: "fallback",
          name: "promo",
          title: "Promotional Carousel",
          slides: [
            {
              id: "1",
              image: "/src/assets/anime-banner3.jpg",
              title: "Summer Sale",
              subtitle: "Up to 50% off on selected anime figures",
              ctaText: "Shop Sale",
              ctaLink: "/anime-figures",
              overlay: true,
              order: 1
            },
            {
              id: "2",
              image: "/src/assets/deku-figure.jpg",
              title: "New Collection",
              subtitle: "Latest arrivals from popular anime series",
              ctaText: "Explore New",
              ctaLink: "#featured-collection",
              overlay: true,
              order: 2
            },
            {
              id: "3",
              image: "/src/assets/luffy-figure.jpg",
              title: "Free Shipping",
              subtitle: "On orders above ₹999",
              ctaText: "Shop Now",
              ctaLink: "/anime-figures",
              overlay: true,
              order: 3
            }
          ],
          autoPlay: true,
          interval: 4000,
          height: "h-[400px]",
          isActive: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPromoCarousel();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      {/* Promotional Carousel */}
      {!loading && promoCarousel && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Special Offers</h2>
            <Carousel 
              slides={promoCarousel.slides} 
              height={promoCarousel.height}
              autoPlay={promoCarousel.autoPlay}
              interval={promoCarousel.interval}
            />
          </div>
        </section>
      )}
      
      <div id="categories-section">
        <CategorySection />
      </div>
      <div id="featured-collection">
        <FeaturedProducts />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
