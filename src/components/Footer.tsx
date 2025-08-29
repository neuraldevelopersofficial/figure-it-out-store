import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-brand-black text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-brand-red to-brand-red-dark text-white px-3 py-2 rounded-lg font-bold text-xl">
                FIGURE
              </div>
              <span className="font-bold text-xl">IT OUT</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your ultimate destination for premium anime figures, collectible keychains, and exclusive merchandise. 
              Authentic products with worldwide shipping.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-brand-red p-2">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-brand-red p-2">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-brand-red p-2">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-brand-red p-2">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/anime-figures" className="block text-gray-300 hover:text-brand-red transition-colors text-sm">Anime Figures</Link>
              <Link to="/keychains" className="block text-gray-300 hover:text-brand-red transition-colors text-sm">Keychains</Link>
              <Link to="/search?q=new" className="block text-gray-300 hover:text-brand-red transition-colors text-sm">New Arrivals</Link>
              <Link to="/search?q=best" className="block text-gray-300 hover:text-brand-red transition-colors text-sm">Best Sellers</Link>
              <Link to="/search?q=sale" className="block text-gray-300 hover:text-brand-red transition-colors text-sm">Sale Items</Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Service</h3>
            <div className="space-y-2">
              <Link to="/orders" className="block text-gray-300 hover:text-brand-red transition-colors text-sm">Track Your Order</Link>
            <Link to="/" className="block text-gray-300 hover:text-brand-red transition-colors text-sm">Returns & Exchanges</Link>
            <Link to="/" className="block text-gray-300 hover:text-brand-red transition-colors text-sm">Shipping Info</Link>
            <Link to="/" className="block text-gray-300 hover:text-brand-red transition-colors text-sm">Size Guide</Link>
            <Link to="/" className="block text-gray-300 hover:text-brand-red transition-colors text-sm">FAQs</Link>
            </div>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stay Connected</h3>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Mail className="h-4 w-4 text-brand-red" />
                <span>support@figureitout.in</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Phone className="h-4 w-4 text-brand-red" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <MapPin className="h-4 w-4 text-brand-red" />
                <span>Mumbai, India</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-2">
              <p className="text-sm text-gray-300">Subscribe for exclusive offers</p>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Enter your email" 
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm"
                />
                <Button className="bg-brand-red hover:bg-brand-red-dark text-white px-4">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © 2024 FIGUREITOUT. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link to="/" className="hover:text-brand-red transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-brand-red transition-colors">Terms of Service</Link>
            <Link to="/" className="hover:text-brand-red transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-brand-red">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-white font-semibold text-lg">HOMEGROWN INDIAN BRAND</p>
              <p className="text-white/90 text-sm mt-1">Over 10k Happy Customers</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;