import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, IndianRupee, RotateCcw, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState } from "react";

const Footer = () => {
  const [expandedSections, setExpandedSections] = useState({
    navigation: false,
    about: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <footer className="bg-gray-100 text-gray-800">
      {/* Single Compact Footer Rectangle */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {/* NEED HELP */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-red-600">NEED HELP:</h3>
            <div className="space-y-1">
              <Link to="/contact" className="block text-gray-700 hover:text-red-600 transition-colors text-xs">Contact Us</Link>
              <Link to="/orders" className="block text-gray-700 hover:text-red-600 transition-colors text-xs">Track Order</Link>
              <Link to="/returns" className="block text-gray-700 hover:text-red-600 transition-colors text-xs">Returns & Refunds</Link>
              <Link to="/faq" className="block text-gray-700 hover:text-red-600 transition-colors text-xs">FAQs</Link>
              <Link to="/account" className="block text-gray-700 hover:text-red-600 transition-colors text-xs">My Account</Link>
            </div>
            
            {/* Trust Badges */}
            <div className="space-y-2 mt-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <IndianRupee className="h-2 w-2 text-white" />
                </div>
                <span className="text-xs text-gray-700">COD Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <RotateCcw className="h-2 w-2 text-white" />
                </div>
                <span className="text-xs text-gray-700">30 Days Returns</span>
              </div>
            </div>
          </div>

          {/* COMPANY */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-red-600">COMPANY:</h3>
            <div className="space-y-1">
              <Link to="/about" className="block text-gray-700 hover:text-red-600 transition-colors text-xs">About Us</Link>
              <Link to="/careers" className="block text-gray-700 hover:text-red-600 transition-colors text-xs">Careers</Link>
              <Link to="/gift-vouchers" className="block text-gray-700 hover:text-red-600 transition-colors text-xs">Gift Vouchers</Link>
              <Link to="/community" className="block text-gray-700 hover:text-red-600 transition-colors text-xs">Community</Link>
            </div>
          </div>

          {/* MORE INFO */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-red-600">MORE INFO:</h3>
            <div className="space-y-1">
              <Link to="/terms" className="block text-gray-700 hover:text-red-600 transition-colors text-xs">T&C</Link>
              <Link to="/privacy" className="block text-gray-700 hover:text-red-600 transition-colors text-xs">Privacy Policy</Link>
              <Link to="/sitemap" className="block text-gray-700 hover:text-red-600 transition-colors text-xs">Sitemap</Link>
              <Link to="/newsletter" className="block text-gray-700 hover:text-red-600 transition-colors text-xs">Get Notified</Link>
              <Link to="/blog" className="block text-gray-700 hover:text-red-600 transition-colors text-xs">Blogs</Link>
            </div>
          </div>

          {/* STORE & SOCIAL */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-red-600">STORE NEAR ME:</h3>
            <div className="space-y-1">
              <Link to="/stores/mumbai" className="block text-gray-700 hover:text-red-600 transition-colors text-xs">Mumbai</Link>
              <Link to="/stores/pune" className="block text-gray-700 hover:text-red-600 transition-colors text-xs">Pune</Link>
              <Link to="/stores/bangalore" className="block text-gray-700 hover:text-red-600 transition-colors text-xs">Bangalore</Link>
              <Link to="/stores" className="block text-blue-600 font-bold hover:text-blue-800 transition-colors text-xs">View More</Link>
            </div>
            
            {/* Social Media */}
            <div className="mt-3">
              <h4 className="text-xs font-semibold text-gray-800 mb-2">Follow Us:</h4>
              <div className="flex space-x-2">
                <Button className="w-6 h-6 bg-blue-600 rounded-full p-0 hover:bg-blue-700 transition-colors">
                  <Facebook className="h-3 w-3 text-white" />
                </Button>
                <Button 
                  className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-0 hover:opacity-90 transition-opacity"
                  onClick={() => window.open('https://www.instagram.com/figureitout.in?igsh=MTRsem9vcnVlMzZteA==', '_blank')}
                >
                  <Instagram className="h-3 w-3 text-white" />
                </Button>
                <Button className="w-6 h-6 bg-yellow-500 rounded-full p-0 hover:bg-yellow-600 transition-colors">
                  <div className="h-3 w-3 text-white font-bold text-xs">S</div>
                </Button>
                <Button className="w-6 h-6 bg-black rounded-full p-0 hover:bg-gray-800 transition-colors">
                  <Twitter className="h-3 w-3 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Payment & Copyright */}
        <div className="mt-6 pt-4 border-t border-gray-300">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
            {/* Payment Methods */}
            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-gray-800">100% Secure Payment:</span>
              <div className="flex items-center space-x-2">
                <div className="bg-gray-200 px-2 py-1 rounded text-xs">PhonePe</div>
                <div className="bg-gray-200 px-2 py-1 rounded text-xs">GPay</div>
                <div className="bg-gray-200 px-2 py-1 rounded text-xs">Paytm</div>
                <div className="bg-gray-200 px-2 py-1 rounded text-xs">COD</div>
              </div>
            </div>

            {/* Shipping & Copyright */}
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <span>Shipping: DTDC, Delhivery</span>
              <span>© Figure It Out 2024-25</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;