import React from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";

const Index = () => {

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
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
