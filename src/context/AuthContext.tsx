import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// User interface for our custom backend
interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  pincode: string;
  address?: string;
  city: string;
  state: string;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing token and fetch user profile
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await apiClient.getProfile();
      if (response.success) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Clear invalid token
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.signup({
        email,
        password,
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        pincode: userData.pincode || '',
        address: userData.address || '',
        city: userData.city || '',
        state: userData.state || '',
      });

      if (response.success) {
        // Set token and user
        apiClient.setToken(response.token);
        setUser(response.user);
        
        toast({
          title: "Account created successfully!",
          description: "Welcome to Figure It Out!",
        });

        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to create account' };
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const response = await apiClient.login({ email, password });

      if (response.success) {
        // Set token and user
        apiClient.setToken(response.token);
        setUser(response.user);
        
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.error || 'Failed to sign in' };
      }
    } catch (error: any) {
      console.error('Signin error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      // Clear token and user
      apiClient.clearToken();
      setUser(null);
      
      // Clear cart data from localStorage when user logs out
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cart_')) {
          localStorage.removeItem(key);
        }
      });

      toast({
        title: "Signed out successfully",
        description: "You have been signed out.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateUserProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const response = await apiClient.updateProfile(updates);

      if (response.success) {
        // Update local user state
        setUser(prev => prev ? { ...prev, ...updates } : null);

        toast({
          title: "Profile updated successfully!",
          description: "Your profile has been updated.",
        });

        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to update profile' };
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateUserProfile,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
