// API Configuration
const getApiBaseUrl = () => {
  // Check if we're in production
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Production environment - use production API
    return 'https://api.figureitoutstore.in/api';
  }
  // Development environment - use local API
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Log API configuration for debugging
console.log('🌐 API Configuration:', {
  baseUrl: API_BASE_URL,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
  environment: typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'production' : 'development'
});

// API Client
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    // Do not add CORS headers on the client side
    // CORS headers should be set by the server

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const message = errorData.error || 'Too many requests';
          const error = new Error(message);
          (error as any).status = 429;
          (error as any).retryAfter = retryAfter;
          throw error;
        }
        
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async signup(userData: any) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(updates: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async changePassword(passwords: { currentPassword: string; newPassword: string }) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwords),
    });
  }

  // Razorpay endpoints
  async createRazorpayOrder(amount: number, currency: string = 'INR') {
    return this.request('/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount, currency }),
    });
  }

  async verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    method?: string; // Add optional method parameter
  }) {
    return this.request('/razorpay/verify-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Product endpoints
  async getProducts() {
    return this.request('/products');
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async getProductsByCategory(category: string) {
    return this.request(`/products/category/${category}`);
  }

  async searchProducts(query: string) {
    return this.request(`/products/search?q=${encodeURIComponent(query)}`);
  }

  // Order endpoints
  async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }
  
  async updateOrderStatus(orderId: string, status: string) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getOrders() {
    return this.request('/orders');
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAdminOrders() {
    return this.request('/admin/orders');
  }

  async getAdminProducts() {
    return this.request('/admin/products');
  }

  async createProduct(productData: any) {
    return this.request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any) {
    return this.request(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteAllProducts() {
    try {
      return await this.request('/admin/products/all', {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error in deleteAllProducts:', error);
      throw error;
    }
  }

  async cleanupInvalidProducts() {
    try {
      return await this.request('/admin/products/cleanup', {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error in cleanupInvalidProducts:', error);
      throw error;
    }
  }

  async deleteProduct(id: string) {
    return this.request(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkUpsertProducts(file: File, mode: 'add' | 'update' | 'upsert' = 'upsert', imageMap?: Record<string, string>) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);
    
    // Add imageMap if provided
    if (imageMap && Object.keys(imageMap).length > 0) {
      formData.append('imageMap', JSON.stringify(imageMap));
    }
    
    return this.request('/admin/products/bulk', {
      method: 'POST',
      body: formData,
    });
  }

  async getAdminCustomers() {
    return this.request('/admin/customers');
  }

  // Generic HTTP methods for other endpoints
  async get(endpoint: string) {
    return this.request(endpoint);
  }

  async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export for use in components
export default apiClient;

// Helpers to map API snake_case product to frontend Product type
export function mapApiProduct(p: any) {
  if (!p) return null as any;
  return {
    id: String(p.id),
    name: p.name ?? '',
    price: Number(p.price ?? 0),
    originalPrice: p.original_price !== undefined && p.original_price !== null ? Number(p.original_price) : undefined,
    image: p.image ?? '',
    images: Array.isArray(p.images) ? p.images : [],
    category: p.category ?? '',
    rating: Number(p.rating ?? 0),
    reviews: Number(p.reviews ?? 0),
    isNew: Boolean(p.is_new ?? false),
    isOnSale: Boolean(p.is_on_sale ?? false),
    discount: p.discount !== undefined && p.discount !== null ? Number(p.discount) : undefined,
    description: p.description ?? '',
    inStock: typeof p.in_stock === 'boolean' ? p.in_stock : (p.stock_quantity !== undefined ? Number(p.stock_quantity) > 0 : true),
  };
}

export function mapApiProducts(arr: any[]): any[] {
  return (arr || []).map(mapApiProduct);
}
