import { useState } from "react";
import { Search, ShoppingCart, User, Menu, MapPin, Heart, LogOut, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
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
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { getCartItemCount, state } = useStore();
  const { user, signOut, isAdmin } = useAuth();

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
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Categories */}
          <nav className="hidden lg:flex items-center space-x-8">
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

          {/* Center - Logo */}
          <Link to="/" className="flex items-center justify-center flex-1">
            <img 
              src="/logo.png" 
              alt="FIGURE IT OUT" 
              className="h-16 w-auto"
            />
          </Link>

          {/* Right Side - Search, Location, Wishlist, Cart, User */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center w-64">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-10 pr-4 border-input-border focus:border-brand-red"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* Location */}
            {user && <LocationSelector />}

            {/* Wishlist */}
            <Link to="/wishlist">
              <Button variant="ghost" size="sm" className="relative">
                <Heart className="h-5 w-5 text-black" />
                <Badge 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs bg-brand-red text-black transition-opacity"
                  style={{ opacity: state.wishlist.length > 0 ? 1 : 0 }}
                >
                  {state.wishlist.length}
                </Badge>
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5 text-black" />
                <Badge 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs bg-brand-red text-black transition-opacity"
                  style={{ opacity: getCartItemCount() > 0 ? 1 : 0 }}
                >
                  {getCartItemCount()}
                </Badge>
              </Button>
            </Link>

            {/* User Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-brand-red text-black text-sm">
                        {getUserInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
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
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-brand-red hover:bg-brand-red-dark">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Mobile Search */}
        <div className="lg:hidden mt-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search products..." 
              className="pl-10 pr-4 border-input-border focus:border-brand-red"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border">
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