import React from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FeaturedProducts from "@/components/FeaturedProducts";
import KeychainShowcase from "@/components/KeychainShowcase";
import Footer from "@/components/Footer";
import { PageTransition } from "@/components/ui/page-transition";

const Index = () => {

  return (
    <PageTransition className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      <div id="featured-collection">
        <FeaturedProducts />
      </div>
      
      <div id="keychain-showcase">
        <KeychainShowcase />
      </div>
      
      <div id="categories-section">
        <CategorySection />
      </div>
      <Footer />
    </PageTransition>
  );
};

export default Index;
