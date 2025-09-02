import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isOnSale?: boolean;
  discount?: number;
  description?: string;
  inStock?: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

export interface Address {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
  addressType: string;
  userId?: string;
  created_at?: string;
  updated_at?: string;
}

interface StoreState {
  cart: CartItem[];
  wishlist: Product[];
  userLocation: string | null;
  currentUserId: string | null; // Track current user
  addresses: Address[];
  selectedAddress: Address | null;
}

type StoreAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_TO_WISHLIST'; payload: Product }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'SET_USER_LOCATION'; payload: string }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'SET_USER'; payload: string | null }
  | { type: 'SET_ADDRESSES'; payload: Address[] }
  | { type: 'SET_SELECTED_ADDRESS'; payload: Address | null };

const initialState: StoreState = {
  cart: [],
  wishlist: [],
  userLocation: null,
  currentUserId: null,
  addresses: [],
  selectedAddress: null
};

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }]
      };
    }
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };
    
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        ).filter(item => item.quantity > 0)
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        cart: []
      };
    
    case 'ADD_TO_WISHLIST':
      if (state.wishlist.find(item => item.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        wishlist: [...state.wishlist, action.payload]
      };
    
    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.filter(item => item.id !== action.payload)
      };
    
    case 'SET_USER_LOCATION':
      return {
        ...state,
        userLocation: action.payload
      };
    
    case 'SET_CART':
      return {
        ...state,
        cart: action.payload
      };

    case 'SET_USER':
      return {
        ...state,
        currentUserId: action.payload
      };
    case 'SET_ADDRESSES':
      return {
        ...state,
        addresses: action.payload
      };
    case 'SET_SELECTED_ADDRESS':
      return {
        ...state,
        selectedAddress: action.payload
      };
    
    default:
      return state;
  }
}

interface StoreContextType {
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  setCurrentUser: (userId: string | null) => void;
  addresses: Address[];
  selectedAddress: Address | null;
  setAddresses: (addresses: Address[]) => void;
  setSelectedAddress: (address: Address | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  // Auto-sync user state based on localStorage token
  useEffect(() => {
    const checkUserState = () => {
      const token = localStorage.getItem('auth_token');
      const currentUserId = token ? 'user_logged_in' : null;
      
      if (state.currentUserId !== currentUserId) {
        dispatch({ type: 'SET_USER', payload: currentUserId });
      }
    };

    // Check on mount
    checkUserState();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        checkUserState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [state.currentUserId]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const saveCart = () => {
      const cartData = {
        cart: state.cart,
        userId: state.currentUserId,
        timestamp: Date.now()
      };
      
      // Save to localStorage with user-specific key
      const key = state.currentUserId ? `cart_${state.currentUserId}` : 'cart_guest';
      localStorage.setItem(key, JSON.stringify(cartData));
    };

    saveCart();
  }, [state.cart, state.currentUserId]);

  // Load cart when user changes
  useEffect(() => {
    const loadCart = () => {
      const key = state.currentUserId ? `cart_${state.currentUserId}` : 'cart_guest';
      const savedCart = localStorage.getItem(key);
      
      if (savedCart) {
        try {
          const cartData = JSON.parse(savedCart);
          // Only load cart if it's recent (within last 24 hours)
          const isRecent = Date.now() - cartData.timestamp < 24 * 60 * 60 * 1000;
          if (isRecent && cartData.cart) {
            dispatch({ type: 'SET_CART', payload: cartData.cart });
          } else {
            dispatch({ type: 'SET_CART', payload: [] });
          }
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
          dispatch({ type: 'SET_CART', payload: [] });
        }
      } else {
        dispatch({ type: 'SET_CART', payload: [] });
      }
    };

    loadCart();
  }, [state.currentUserId]);

  // Clear cart when user logs out
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
    // Clear all cart data from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cart_')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  // Fetch addresses when user logs in
  useEffect(() => {
    const fetchUserAddresses = async () => {
      if (state.currentUserId) {
        try {
          const response = await apiClient.get('/user/profile');
          // Check if response.data exists before accessing addresses
          if (response.success && response.user) {
            // Map backend address fields to frontend fields
            const addresses = [];
            
            if (response.user.addresses && Array.isArray(response.user.addresses)) {
              response.user.addresses.forEach((addr: any) => {
                if (addr) {
                  addresses.push({
                    id: addr.id || '',
                    name: addr.name || '',
                    addressLine1: addr.address || '',
                    addressLine2: addr.address_line2 || '',
                    landmark: addr.landmark || '',
                    city: addr.city || '',
                    state: addr.state || '',
                    pincode: addr.pincode || '',
                    phone: addr.phone || '',
                    isDefault: addr.is_default || false,
                    addressType: addr.address_type || 'Home'
                  });
                }
              });
            }
            
            console.log('StoreContext - Fetched addresses:', addresses);
            dispatch({ type: 'SET_ADDRESSES', payload: addresses });
            const defaultAddress = addresses.find((a: Address) => a.isDefault) || addresses[0];
            if (defaultAddress) {
              dispatch({ type: 'SET_SELECTED_ADDRESS', payload: defaultAddress });
            }
          } else {
            // If no addresses found, set empty array
            dispatch({ type: 'SET_ADDRESSES', payload: [] });
          }
        } catch (error) {
          console.error("Failed to fetch user addresses", error);
        }
      } else {
        // Clear addresses when user logs out
        dispatch({ type: 'SET_ADDRESSES', payload: [] });
        dispatch({ type: 'SET_SELECTED_ADDRESS', payload: null });
      }
    };
    fetchUserAddresses();
  }, [state.currentUserId]);

  // Set current user (called from AuthContext)
  const setCurrentUser = useCallback((userId: string | null) => {
    dispatch({ type: 'SET_USER', payload: userId });
  }, []);

  const setAddresses = useCallback((addresses: Address[]) => {
    dispatch({ type: 'SET_ADDRESSES', payload: addresses });
  }, []);

  const setSelectedAddress = useCallback((address: Address | null) => {
    dispatch({ type: 'SET_SELECTED_ADDRESS', payload: address });
  }, []);

  const addToCart = useCallback((product: Product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id: productId, quantity } });
  }, []);

  const addToWishlist = useCallback((product: Product) => {
    dispatch({ type: 'ADD_TO_WISHLIST', payload: product });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return state.wishlist.some(item => item.id === productId);
  }, [state.wishlist]);

  const getCartTotal = useCallback(() => {
    if (!state.cart) return 0;
    return state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [state.cart]);

  const getCartItemCount = useCallback(() => {
    if (!state.cart) return 0;
    return state.cart.reduce((total, item) => total + item.quantity, 0);
  }, [state.cart]);

  const value: StoreContextType = {
    state,
    dispatch,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getCartTotal,
    getCartItemCount,
    setCurrentUser,
    addresses: state.addresses,
    selectedAddress: state.selectedAddress,
    setAddresses,
    setSelectedAddress
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
