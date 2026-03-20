import { useState, useEffect } from "react";
import { Search, ShoppingCart, User, Menu, MapPin, Heart, LogOut, Settings, Shield, Home, Package, Star, Users, BarChart3, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LocationSelector } from "./layout/LocationSelector";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typewriterText, setTypewriterText] = useState("");
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartItemCount, state } = useStore();
  const { user, signOut, isAdmin } = useAuth();

  // Function to check if a menu item is active
  const isActivePage = (path: string) => {
    return location.pathname === path;
  };

  // Product names for typewriter effect
  const productNames = [
    "Naruto Uzumaki Figure",
    "Dragon Ball Z Goku Keychain",
    "Attack on Titan Levi Figure",
    "Pokemon Pikachu Keychain",
    "One Piece Luffy Gear 5",
    "Demon Slayer Tanjiro Keychain",
    "My Hero Academia Deku Figure",
    "Studio Ghibli Totoro Keychain",
    "Jujutsu Kaisen Gojo Figure",
    "Hunter x Hunter Gon Keychain",
    "Bleach Ichigo Figure",
    "Death Note L Keychain",
    "Naruto Sage Mode Figure",
    "Goku Super Saiyan Keychain",
    "Levi Ackerman Figure",
    "Pikachu Thunder Keychain",
    "Luffy Gear 4 Figure",
    "Tanjiro Water Breathing Keychain",
    "Deku One For All Figure",
    "Totoro Cat Bus Keychain",
    "Gojo Infinity Figure",
    "Gon Jajanken Keychain",
    "Ichigo Bankai Figure",
    "L Detective Keychain",
    "Naruto Rasengan Figure",
    "Goku Kamehameha Keychain",
    "Levi 3D Gear Figure",
    "Pikachu Volt Tackle Keychain",
    "Luffy Gomu Gomu Figure",
    "Tanjiro Hinokami Keychain",
    "Deku Full Cowl Figure",
    "Totoro Umbrella Keychain",
    "Gojo Hollow Purple Figure",
    "Gon Fishing Rod Keychain",
    "Ichigo Getsuga Figure",
    "L Potato Chips Keychain"
  ];

  // Typewriter effect
  useEffect(() => {
    const currentProduct = productNames[currentProductIndex];
    
    if (isTyping) {
      // Typing effect
      if (typewriterText.length < currentProduct.length) {
        const timeout = setTimeout(() => {
          setTypewriterText(currentProduct.slice(0, typewriterText.length + 1));
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, wait then start erasing
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      // Erasing effect
      if (typewriterText.length > 0) {
        const timeout = setTimeout(() => {
          setTypewriterText(typewriterText.slice(0, -1));
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        // Finished erasing, move to next product
        setCurrentProductIndex((prev) => (prev + 1) % productNames.length);
        setIsTyping(true);
      }
    }
  }, [typewriterText, currentProductIndex, isTyping, productNames]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      {/* Main Header */}
      <div className="container mx-auto px-3 sm:px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left Side - Main Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Hamburger Menu */}
            <DropdownMenu open={isMainMenuOpen} onOpenChange={setIsMainMenuOpen}>
              <DropdownMenuTrigger asChild>
                <div className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="start">
                <DropdownMenuLabel className="font-semibold text-gray-700">Navigation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link to="/" className={`flex items-center transition-colors ${
                    isActivePage('/') 
                      ? 'text-red-600' 
                      : 'text-gray-700'
                  } hover:text-red-600 hover:bg-red-50`}>
                    <Home className="mr-2 h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/anime-figures" className={`flex items-center transition-colors ${
                    isActivePage('/anime-figures') 
                      ? 'text-red-600' 
                      : 'text-gray-700'
                  } hover:text-red-600 hover:bg-red-50`}>
                    <Package className="mr-2 h-4 w-4" />
                    <span>Anime Figures</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/keychains" className={`flex items-center transition-colors ${
                    isActivePage('/keychains') 
                      ? 'text-red-600' 
                      : 'text-gray-700'
                  } hover:text-red-600 hover:bg-red-50`}>
                    <Star className="mr-2 h-4 w-4" />
                    <span>Keychains</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/all-products" className={`flex items-center transition-colors ${
                    isActivePage('/all-products') 
                      ? 'text-red-600' 
                      : 'text-gray-700'
                  } hover:text-red-600 hover:bg-red-50`}>
                    <Package className="mr-2 h-4 w-4" />
                    <span>All Products</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-semibold text-gray-700">Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className={`flex items-center transition-colors ${
                        isActivePage('/profile') 
                          ? 'text-red-600' 
                          : 'text-gray-700'
                      } hover:text-red-600 hover:bg-red-50`}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className={`flex items-center transition-colors ${
                        isActivePage('/orders') 
                          ? 'text-red-600' 
                          : 'text-gray-700'
                      } hover:text-red-600 hover:bg-red-50`}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/wishlist" className={`flex items-center transition-colors ${
                        isActivePage('/wishlist') 
                          ? 'text-red-600' 
                          : 'text-gray-700'
                      } hover:text-red-600 hover:bg-red-50`}>
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Wishlist</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="font-semibold text-gray-700">Admin</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className={`flex items-center transition-colors ${
                            isActivePage('/admin') 
                              ? 'text-red-600' 
                              : 'text-gray-700'
                          } hover:text-red-600 hover:bg-red-50`}>
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem asChild>
                          <Link to="/admin/products" className={`flex items-center transition-colors ${
                            isActivePage('/admin/products') 
                              ? 'text-red-600' 
                              : 'text-gray-700'
                          } hover:text-red-600 hover:bg-red-50`}>
                            <Package className="mr-2 h-4 w-4" />
                            <span>Manage Products</span>
                          </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem asChild>
                          <Link to="/admin/orders" className={`flex items-center transition-colors ${
                            isActivePage('/admin/orders') 
                              ? 'text-red-600' 
                              : 'text-gray-700'
                          } hover:text-red-600 hover:bg-red-50`}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            <span>Manage Orders</span>
                          </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem asChild>
                          <Link to="/admin/users" className={`flex items-center transition-colors ${
                            isActivePage('/admin/users') 
                              ? 'text-red-600' 
                              : 'text-gray-700'
                          } hover:text-red-600 hover:bg-red-50`}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Manage Users</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/login" className="flex items-center text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <User className="mr-2 h-4 w-4" />
                        <span>Sign In</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/signup" className="flex items-center text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <User className="mr-2 h-4 w-4" />
                        <span>Sign Up</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/help" className="flex items-center text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Categories - Hidden on smaller screens */}
            <nav className="hidden lg:flex items-center space-x-6">
            <Link 
              to="/anime-figures" 
              className="text-sm text-foreground hover:text-brand-red transition-colors font-medium"
            >
              ANIME FIGURES
            </Link>
            <Link 
              to="/keychains" 
              className="text-sm text-foreground hover:text-brand-red transition-colors font-medium"
            >
              KEYCHAINS
            </Link>
            <span className="text-sm text-muted-foreground font-medium">
              HOT WHEELS
            </span>
            <span className="text-sm text-muted-foreground font-medium">
              TRENDING
            </span>
            </nav>
          </div>

          {/* Center - Logo */}
          <Link to="/" className="flex items-center justify-center flex-1">
            <img 
              src="/logo.png" 
              alt="FIGURE IT OUT" 
              className="h-8 sm:h-10 md:h-12 w-auto transition-all duration-300 ease-in-out hover:scale-105"
            />
          </Link>

          {/* Right Side - Search, Location, Wishlist, Cart, User */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            {/* Search Bar - Hidden on mobile, shown in mobile section below */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center w-48 lg:w-56">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                <div className="search-box-gradient">
                  <Input 
                    placeholder={typewriterText || "Search products..."} 
                    className="pl-10 pr-4 border-0 bg-transparent focus:outline-none relative z-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </form>

            {/* Location */}
            {user && <LocationSelector />}

            {/* User Profile Icon */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center text-popover-foreground">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center text-popover-foreground">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="flex items-center text-popover-foreground">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Wishlist</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center text-popover-foreground">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-popover-foreground">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </Link>
            )}

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              {state.wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white shadow-sm">
                  {state.wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white shadow-sm">
                  {getCartItemCount()}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-3 px-3 sm:px-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
            <div className="search-box-gradient">
              <Input 
                placeholder={typewriterText || "Search products..."} 
                className="pl-10 pr-4 border-0 bg-transparent focus:outline-none relative z-10 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pb-4 border-t border-border px-3 sm:px-4">
            <nav className="flex flex-col space-y-2 pt-4">
              <Link 
                to="/anime-figures" 
                className="text-foreground hover:text-brand-red transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                ANIME FIGURES
              </Link>
              <Link 
                to="/keychains" 
                className="text-foreground hover:text-brand-red transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                KEYCHAINS
              </Link>
              <span className="text-muted-foreground font-medium py-2">
                HOT WHEELS <Badge variant="secondary" className="ml-1 text-xs">Coming Soon</Badge>
              </span>
              <span className="text-muted-foreground font-medium py-2">
                TRENDING <Badge variant="secondary" className="ml-1 text-xs">Coming Soon</Badge>
              </span>
              
              {/* Mobile Auth */}
              {!user && (
                <div className="pt-4 border-t border-border">
                  <Link 
                    to="/login" 
                    className="block text-foreground hover:text-brand-red transition-colors font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup" 
                    className="block text-foreground hover:text-brand-red transition-colors font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
    </header>
  );
};

export default Header;