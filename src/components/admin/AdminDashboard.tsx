import React, { useState, useEffect } from "react";
import { 
  Package, 
  ShoppingCart, 
  Image, 
  BarChart3, 
  Users, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Upload,
  FileSpreadsheet,
  Download,
  Sliders,
  X,
  Image as ImageIcon,
  Trash,
  AlertCircle
} from "lucide-react";
import { FallbackImage } from "@/components/ui/fallback-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { Navigate } from "react-router-dom";
import ProductForm from "./ProductForm";
import ImageUpload from "./ImageUpload";
import BulkImageUpload from "./BulkImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockProducts: number;
}

interface Order {
  id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  customer_email?: string; // Added for order details
}

interface Product {
  id: string;
  name: string;
  category: string;
  stock_quantity: number;
  price: number;
  image?: string; // Main image field
  images?: string[]; // Additional images array
}

interface Customer {
  id: string;
  full_name: string;
  email: string;
  city: string;
  state: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
}

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

interface Carousel {
  id: string;
  name: string;
  title: string;
  slides: Slide[];
  autoPlay: boolean;
  interval: number;
  height: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    lowStockProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false); // New state for add product form
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // New state for editing product
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkMode, setBulkMode] = useState<'add' | 'update' | 'upsert' | 'deleteall'>('upsert');
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkSummary, setBulkSummary] = useState<string | null>(null);
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  
  // Carousel management state
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [showAddCarousel, setShowAddCarousel] = useState(false);
  const [selectedCarousel, setSelectedCarousel] = useState<Carousel | null>(null);
  const [showAddSlide, setShowAddSlide] = useState(false);
  const [selectedCarouselForSlide, setSelectedCarouselForSlide] = useState<Carousel | null>(null);
  
  // Order deletion state
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Fetch admin data
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch carousels
      try {
        console.log('🔍 AdminDashboard - Fetching carousels...');
        const carouselResponse = await apiClient.get('/carousels/admin/all');
        console.log('🔍 AdminDashboard - Carousel response:', carouselResponse);
        if (carouselResponse.success) {
          setCarousels(carouselResponse.carousels || []);
          console.log('🔍 AdminDashboard - Set carousels:', carouselResponse.carousels?.length || 0);
        } else {
          console.log('❌ AdminDashboard - Carousel response not successful:', carouselResponse);
        }
      } catch (error) {
        console.error('❌ AdminDashboard - Failed to fetch carousels:', error);
        setCarousels([]);
      }
      
      // Fetch admin statistics
      const statsResponse = await apiClient.getAdminStats();
      if (statsResponse.success) {
        setStats(statsResponse.stats);
      } else {
        // Set default stats if API fails
        setStats({
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          totalCustomers: 0,
          pendingOrders: 0,
          lowStockProducts: 0
        });
      }

      // Fetch recent orders
      const ordersResponse = await apiClient.getAdminOrders();
      if (ordersResponse.success && Array.isArray(ordersResponse.orders)) {
        setRecentOrders(ordersResponse.orders.slice(0, 5)); // Get latest 5 orders for overview
        setAllOrders(ordersResponse.orders); // Store all orders
      } else {
        setRecentOrders([]);
        setAllOrders([]);
      }

      // Fetch recent products
      const productsResponse = await apiClient.getAdminProducts();
      if (productsResponse.success && Array.isArray(productsResponse.products)) {
        // Filter out invalid/incomplete products and clean the data
        const validProducts = productsResponse.products
          .filter(product => product && typeof product === 'object')
          .filter(product => product.name && product.name.trim() !== '') // Remove products with empty names
          .filter(product => product.price > 0) // Remove products with 0 price
          .map(product => ({
            ...product,
            name: product.name?.trim() || 'Unnamed Product',
            price: Number(product.price) || 0,
            stock_quantity: Number(product.stock_quantity) || 0,
            category: product.category || 'Uncategorized',
            image: product.image || '/placeholder-product.jpg',
            images: Array.isArray(product.images) ? product.images : []
          }));
        
        setRecentProducts(validProducts.slice(0, 5)); // Get latest 5 products for overview
        setAllProducts(validProducts); // Store all products
      } else {
        setRecentProducts([]);
        setAllProducts([]);
      }

      // Fetch customers
      const customersResponse = await apiClient.getAdminCustomers();
      if (customersResponse.success && Array.isArray(customersResponse.customers)) {
        setCustomers(customersResponse.customers);
      } else {
        setCustomers([]);
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAddProduct = async (product: Omit<Product, 'id'>) => {
    try {
      console.log('Starting product operation:', { 
        isUpdate: !!selectedProduct, 
        productId: selectedProduct?.id, 
        productName: product.name 
      });
      
      let response;
      if (selectedProduct) {
        // Update existing product
        console.log('Updating product with ID:', selectedProduct.id);
        response = await apiClient.updateProduct(selectedProduct.id, product);
      } else {
        // Create new product
        console.log('Creating new product');
        response = await apiClient.createProduct(product);
      }
      
      // Debug: Log the response to understand the structure
      console.log('Product operation response:', response);
      console.log('Response type:', typeof response);
      console.log('Response success:', response?.success);
      console.log('Response keys:', Object.keys(response || {}));
      
      // More robust success check
      const isSuccess = response && (
        response.success === true || 
        response.success === 'true' || 
        response.status === 'success' ||
        response.status === 201 ||
        response.status === 200 ||
        (response.product && (response.success !== false))
      );
      
      console.log('Success check result:', isSuccess);
      
      if (isSuccess) {
        // Show success message
        toast({
          title: selectedProduct ? "Product Updated" : "Product Added",
          description: `Product "${product.name}" ${selectedProduct ? 'updated' : 'added'} successfully.`,
        });
        
        // Close form and refresh data
        setShowAddProduct(false);
        setSelectedProduct(null);
        fetchAdminData(); // Refresh products list
      } else {
        // Show error message
        toast({
          title: "Error",
          description: response?.message || `Failed to ${selectedProduct ? 'update' : 'add'} product.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error with product operation:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        productName: product.name,
        isUpdate: !!selectedProduct
      });
      
      toast({
        title: "Error",
        description: `Failed to ${selectedProduct ? 'update' : 'add'} product: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowAddProduct(true); // Use the same form for editing
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      const response = await apiClient.deleteProduct(productId);
      if (response.success) {
        toast({
          title: "Product Deleted",
          description: `Product deleted successfully.`,
        });
        fetchAdminData(); // Refresh products list
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete product.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAllProducts = async () => {
    if (!window.confirm('Are you sure you want to delete ALL products? This action cannot be undone.')) {
      return;
    }
    try {
      setBulkUploading(true);
      const response = await apiClient.deleteAllProducts();
      if (response.success) {
        toast({
          title: "All Products Deleted",
          description: `All products have been deleted successfully.`,
        });
        setBulkMode('add'); // Set bulk mode to add after deleting all
        fetchAdminData(); // Refresh products list
      } else {
        toast({
          title: "Operation Failed",
          description: response.message || "Failed to delete all products.",
          variant: "destructive"
        });
        // If the operation failed due to server configuration, revert to add mode
        if (response.message && response.message.includes('not available on this server')) {
          setBulkMode('add');
        }
      }
    } catch (error) {
      console.error('Error deleting all products:', error);
      toast({
        title: "Error",
        description: "Failed to delete all products. Please try again later.",
        variant: "destructive"
      });
      // Revert to add mode on error
      setBulkMode('add');
    } finally {
      setBulkUploading(false);
    }
  };

  // Clean up invalid products
  const handleCleanupInvalidProducts = async () => {
    if (!window.confirm('This will remove all products with missing names, 0 price, or 0 stock. Continue?')) {
      return;
    }
    
    try {
      setBulkUploading(true);
      
      // Use the new backend cleanup endpoint
      const response = await apiClient.cleanupInvalidProducts();
      
      if (response.success) {
        toast({
          title: "Cleanup Complete",
          description: response.message || `Removed ${response.deletedCount} invalid products.`,
        });
        
        // Refresh the data
        fetchAdminData();
      } else {
        toast({
          title: "Cleanup Failed",
          description: response.message || "Failed to clean up invalid products.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Error during cleanup:', error);
      toast({
        title: "Cleanup Failed",
        description: "Failed to clean up invalid products.",
        variant: "destructive"
      });
    } finally {
      setBulkUploading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      toast({ title: 'No file selected', description: 'Please choose a CSV or Excel file to upload.', variant: 'destructive' });
      return;
    }
    
    const maxRetries = 3;
    let retryCount = 0;
    
    const attemptUpload = async (): Promise<any> => {
      try {
        setBulkUploading(true);
        
        // Use the updated bulkUpsertProducts method with imageMap
        const response = await apiClient.bulkUpsertProducts(bulkFile, bulkMode as 'add' | 'update' | 'upsert', imageMap);
        
        if (response.success) {
          const summary = `Mode: ${response.mode} | Processed: ${response.processed}/${response.total} | Created: ${response.created} | Updated: ${response.updated}${response.errors && response.errors.length ? ` | Errors: ${response.errors.length}` : ''}`;
          setBulkSummary(summary);
          toast({ title: 'Bulk upload complete', description: summary });
          fetchAdminData();
          return response;
        } else {
          throw new Error(response.error || 'Upload failed');
        }
      } catch (error: any) {
        console.error(`Bulk upload attempt ${retryCount + 1} failed:`, error);
        
        // Handle rate limiting specifically
        if (error.status === 429 || error.message?.includes('Too many requests')) {
          if (retryCount < maxRetries) {
            retryCount++;
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 2s, 4s, 8s
            toast({ 
              title: 'Rate limited, retrying...', 
              description: `Attempt ${retryCount}/${maxRetries}. Waiting ${delay/1000}s...`, 
              variant: 'default' 
            });
            
            await new Promise(resolve => setTimeout(resolve, delay));
            return attemptUpload();
          } else {
            toast({ 
              title: 'Rate limit exceeded', 
              description: 'Too many requests. Please wait 5 minutes before trying again.', 
              variant: 'destructive' 
            });
            throw error;
          }
        } else {
          throw error;
        }
      }
    };
    
    try {
      await attemptUpload();
    } catch (error: any) {
      toast({ 
        title: 'Bulk upload failed', 
        description: error.message || 'Please check your file format.', 
        variant: 'destructive' 
      });
    } finally {
      setBulkUploading(false);
    }
  };

  const handleCancelProductForm = () => {
    setShowAddProduct(false);
    setSelectedProduct(null);
  };

  const handleViewCustomer = (customerId: string) => {
    // Implement navigation or modal to view customer details
    console.log("Viewing customer:", customerId);
    toast({
      title: "Customer Details",
      description: `Customer ID: ${customerId}`,
    });
  };

  const handleViewCustomerOrders = (customerId: string) => {
    // Implement navigation or modal to view customer orders
    console.log("Viewing customer orders:", customerId);
    toast({
      title: "Customer Orders",
      description: `Orders for customer ID: ${customerId}`,
    });
  };

  const handleViewOrder = (orderId: string) => {
    // Implement navigation or modal to view order details
    console.log("Viewing order:", orderId);
    toast({
      title: "Order Details",
      description: `Order ID: ${orderId}`,
    });
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log('🔄 Admin updating order status:', { orderId, newStatus });
      const response = await apiClient.updateOrderStatusAdmin(orderId, newStatus);
      if (response.success) {
        toast({
          title: "Order Status Updated",
          description: `Order #${orderId} status updated to ${newStatus}.`,
        });
        fetchAdminData(); // Refresh orders list
      } else {
        toast({
          title: "Error",
          description: response.message || `Failed to update order status for #${orderId}.`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      
      // Provide more specific error messages
      let errorMessage = `Failed to update order status for #${orderId}.`;
      
      if (error.message?.includes('Order not found')) {
        errorMessage = `Order #${orderId} not found. It may have been deleted or the ID is incorrect.`;
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = `Network error: Unable to connect to the server. Please check your internet connection.`;
      } else if (error.message?.includes('502')) {
        errorMessage = `Server error: The server is temporarily unavailable. Please try again later.`;
      } else if (error.message?.includes('404')) {
        errorMessage = `Order #${orderId} not found. Please refresh the page and try again.`;
      } else if (error.message?.includes('403')) {
        errorMessage = `Access denied: You don't have permission to update this order.`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Order deletion functions
  const handleDeleteOrder = async (orderId: string) => {
    try {
      console.log('🔄 Admin deleting order:', { orderId });
      const response = await apiClient.deleteOrderAdmin(orderId);
      if (response.success) {
        toast({
          title: "Order Deleted",
          description: `Order #${orderId} has been deleted successfully.`,
        });
        fetchAdminData(); // Refresh orders list
        setShowDeleteConfirm(false);
        setOrderToDelete(null);
      } else {
        toast({
          title: "Error",
          description: response.message || `Failed to delete order #${orderId}.`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error deleting order:', error);
      
      let errorMessage = `Failed to delete order #${orderId}.`;
      
      if (error.message?.includes('Order not found')) {
        errorMessage = `Order #${orderId} not found. It may have already been deleted.`;
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = `Network error: Unable to connect to the server. Please check your internet connection.`;
      } else if (error.message?.includes('500')) {
        errorMessage = `Server error: The server encountered an error while deleting the order.`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleBulkDeleteOrders = async () => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select orders to delete.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🔄 Admin bulk deleting orders:', { orderIds: selectedOrders });
      const response = await apiClient.bulkDeleteOrdersAdmin(selectedOrders);
      if (response.success) {
        toast({
          title: "Orders Deleted",
          description: `${response.deletedCount || selectedOrders.length} orders have been deleted successfully.`,
        });
        fetchAdminData(); // Refresh orders list
        setSelectedOrders([]);
      } else {
        toast({
          title: "Error",
          description: response.message || `Failed to delete orders.`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error bulk deleting orders:', error);
      
      let errorMessage = `Failed to delete orders.`;
      
      if (error.message?.includes('Failed to fetch')) {
        errorMessage = `Network error: Unable to connect to the server. Please check your internet connection.`;
      } else if (error.message?.includes('500')) {
        errorMessage = `Server error: The server encountered an error while deleting the orders.`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAllOrders = () => {
    if (selectedOrders.length === allOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(allOrders.map(order => order.id));
    }
  };

  const confirmDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
    setShowDeleteConfirm(true);
  };

  // Carousel management functions
  const handleDeleteSlide = async (carouselId: string, slideId: string) => {
    try {
      const response = await apiClient.request(`/carousels/admin/${carouselId}/slides/${slideId}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        toast({
          title: "Slide Deleted",
          description: "Slide has been removed successfully.",
        });
        fetchAdminData(); // Refresh data
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete slide. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddCarousel = async (carouselData: any) => {
    try {
      console.log('Creating carousel with data:', carouselData);
      const response = await apiClient.request('/carousels/admin', {
        method: 'POST',
        body: JSON.stringify(carouselData)
      });
      console.log('Carousel creation response:', response);
      
      if (response.success) {
        toast({
          title: "Carousel Created",
          description: "New carousel has been created successfully.",
        });
        setShowAddCarousel(false);
        setSelectedCarousel(null);
        fetchAdminData(); // Refresh data
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create carousel. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create carousel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCarousel = async (carouselId: string, updates: any) => {
    try {
      console.log('Updating carousel:', carouselId, 'with data:', updates);
      const response = await apiClient.request(`/carousels/admin/${carouselId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      console.log('Carousel update response:', response);
      
      if (response.success) {
        toast({
          title: "Carousel Updated",
          description: "Carousel has been updated successfully.",
        });
        setShowAddCarousel(false);
        setSelectedCarousel(null);
        fetchAdminData(); // Refresh data
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update carousel. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update carousel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddSlide = async (carouselId: string, slideData: any) => {
    try {
      console.log('🔍 Adding slide to carousel:', carouselId, 'with data:', slideData);
      const response = await apiClient.request(`/carousels/admin/${carouselId}/slides`, {
        method: 'POST',
        body: JSON.stringify(slideData)
      });
      console.log('🔍 Slide addition response:', response);
      
      if (response.success) {
        toast({
          title: "Slide Added",
          description: "New slide has been added successfully.",
        });
        setShowAddSlide(false);
        setSelectedCarouselForSlide(null);
        fetchAdminData(); // Refresh data
      } else {
        console.error('❌ Slide addition failed:', response);
        toast({
          title: "Error",
          description: response.message || "Failed to add slide. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Slide addition error:', error);
      toast({
        title: "Error",
        description: "Failed to add slide. Please try again.",
        variant: "destructive",
      });
    }
  };



  const handleCancelCarouselForm = () => {
    setShowAddCarousel(false);
    setSelectedCarousel(null);
  };

  const handleCancelSlideForm = () => {
    setShowAddSlide(false);
    setSelectedCarouselForSlide(null);
  };

  // Slide Form Component
  const SlideForm = ({ onSubmit, onCancel, defaultOrder, slide }: {
    onSubmit: (slideData: any) => void;
    onCancel: () => void;
    defaultOrder: number;
    slide?: any;
  }) => {
    const [slideData, setSlideData] = useState({
      image: slide?.image || '',
      title: slide?.title || '',
      subtitle: slide?.subtitle || '',
      ctaText: slide?.ctaText || '',
      ctaLink: slide?.ctaLink || '',
      overlay: slide?.overlay || true,
      order: slide?.order || defaultOrder
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!slideData.image || !slideData.title) {
        toast({
          title: "Missing Information",
          description: "Please fill in image and title fields.",
          variant: "destructive"
        });
        return;
      }
      onSubmit(slideData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Image Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Slide Image *</label>
              <ImageUpload
                onImageUploaded={(imageUrl) => {
                  setSlideData(prev => ({ ...prev, image: imageUrl }));
                }}
                className="mb-2"
              />
              
              {/* Manual URL Input */}
              <input
                type="text"
                value={slideData.image}
                onChange={(e) => setSlideData(prev => ({ ...prev, image: e.target.value }))}
                className="w-full p-2 border rounded text-sm"
                placeholder="Or enter image URL manually"
              />
            </div>
            
            {/* Image Preview */}
            {slideData.image && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Preview</span>
                </div>
                <div className="aspect-video bg-white rounded border overflow-hidden">
                  <FallbackImage 
                    src={slideData.image}
                    alt="Slide preview" 
                    className="w-full h-full object-cover"
                    fallbackSrc="/placeholder-image.png"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Slide Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={slideData.title}
                onChange={(e) => setSlideData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Slide Title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <textarea
                value={slideData.subtitle}
                onChange={(e) => setSlideData(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Slide subtitle or description"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Call-to-Action Text</label>
              <input
                type="text"
                value={slideData.ctaText}
                onChange={(e) => setSlideData(prev => ({ ...prev, ctaText: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Shop Now, Learn More, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Call-to-Action Link</label>
              <input
                type="text"
                value={slideData.ctaLink}
                onChange={(e) => setSlideData(prev => ({ ...prev, ctaLink: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="/products, /category/anime-figures, etc."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Order</label>
                <input
                  type="number"
                  value={slideData.order}
                  onChange={(e) => setSlideData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                  className="w-full p-2 border rounded"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Dark Overlay</label>
                <select 
                  value={slideData.overlay.toString()}
                  onChange={(e) => setSlideData(prev => ({ ...prev, overlay: e.target.value === 'true' }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {slide ? 'Update' : 'Add'} Slide
          </Button>
        </div>
      </form>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            {/* Main loading circle */}
            <div className="w-12 h-12 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
            
            {/* Floating particles */}
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-slate-600 font-medium">Welcome back, {user?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 px-4 py-1.5 text-sm font-medium shadow-sm">
                Admin Access
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchAdminData}
                disabled={loading}
                className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200 hover:shadow-md"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200 hover:shadow-md"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 shadow-sm">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 text-slate-600 font-medium rounded-xl transition-all duration-200"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="products"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 text-slate-600 font-medium rounded-xl transition-all duration-200"
            >
              Products
            </TabsTrigger>
            <TabsTrigger 
              value="orders"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 text-slate-600 font-medium rounded-xl transition-all duration-200"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger 
              value="carousels"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 text-slate-600 font-medium rounded-xl transition-all duration-200"
            >
              Carousels
            </TabsTrigger>
            <TabsTrigger 
              value="customers"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 text-slate-600 font-medium rounded-xl transition-all duration-200"
            >
              Customers
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 text-slate-600 font-medium rounded-xl transition-all duration-200"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Modern Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-600">Total Products</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalProducts}</div>
                  <p className="text-sm text-slate-500 font-medium">
                    Active products in catalog
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-600">Total Orders</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalOrders}</div>
                  <p className="text-sm text-slate-500 font-medium">
                    All time orders
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-600">Total Revenue</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-slate-900 mb-1">₹{stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}</div>
                  <p className="text-sm text-slate-500 font-medium">
                    All time revenue
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-600">Total Customers</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalCustomers}</div>
                  <p className="text-sm text-slate-500 font-medium">
                    Registered customers
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Modern Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/60 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-amber-800">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                      <ShoppingCart className="h-4 w-4 text-white" />
                    </div>
                    Pending Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-amber-700 mb-2">
                    {stats.pendingOrders}
                  </div>
                  <p className="text-sm text-amber-600 font-medium mb-4">
                    Orders awaiting confirmation
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 rounded-xl shadow-md hover:shadow-lg transition-all duration-200" 
                    size="sm"
                    onClick={() => setActiveTab("orders")}
                  >
                    View Orders
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200/60 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-red-800">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                      <Package className="h-4 w-4 text-white" />
                    </div>
                    Low Stock Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-red-700 mb-2">
                    {stats.lowStockProducts}
                  </div>
                  <p className="text-sm text-red-600 font-medium mb-4">
                    Products running low on stock
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 rounded-xl shadow-md hover:shadow-lg transition-all duration-200" 
                    size="sm"
                    onClick={() => setActiveTab("products")}
                  >
                    Manage Inventory
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest customer orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentOrders.length > 0 ? (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="text-sm text-muted-foreground">
                              ₹{order.total_amount ? order.total_amount.toLocaleString() : '0'} • {formatDate(order.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                            <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:text-blue-700">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 border rounded-lg">
                      <p className="text-gray-500">No recent orders</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Products</CardTitle>
                  <CardDescription>Latest added products</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentProducts.length > 0 ? (
                    <div className="space-y-4">
                      {recentProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.category} • ₹{product.price ? product.price.toLocaleString() : '0'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={product.stock_quantity < 10 ? "destructive" : "secondary"}>
                              Stock: {product.stock_quantity}
                            </Badge>
                            <Button size="sm" variant="outline" className="hover:bg-green-50 hover:text-green-700">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No products found
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
                <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                    <ShoppingCart className="h-4 w-4 text-white" />
                  </div>
                  Order Management
                </CardTitle>
                <CardDescription className="text-slate-600 font-medium mt-2">Track and manage customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Bulk Actions */}
                  {allOrders.length > 0 && (
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl border border-slate-200/60">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          {selectedOrders.length} of {allOrders.length} orders selected
                        </span>
                        {selectedOrders.length > 0 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDeleteOrders}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete Selected ({selectedOrders.length})
                          </Button>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Select orders to delete dummy data
                      </div>
                    </div>
                  )}
                  
                  {/* Order List */}
                  {allOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">
                              <input
                                type="checkbox"
                                checked={selectedOrders.length === allOrders.length && allOrders.length > 0}
                                onChange={handleSelectAllOrders}
                                className="rounded"
                              />
                            </th>
                            <th className="text-left p-2">Order ID</th>
                            <th className="text-left p-2">Customer</th>
                            <th className="text-left p-2">Amount</th>
                            <th className="text-left p-2">Status</th>
                            <th className="text-left p-2">Date</th>
                            <th className="text-left p-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allOrders.map((order) => (
                            <tr key={order.id} className="border-b hover:bg-gray-50">
                              <td className="p-2">
                                <input
                                  type="checkbox"
                                  checked={selectedOrders.includes(order.id)}
                                  onChange={() => handleSelectOrder(order.id)}
                                  className="rounded"
                                />
                              </td>
                              <td className="p-2 font-mono text-sm">#{order.id}</td>
                              <td className="p-2">
                                <div>
                                  <p className="font-medium">{order.customer_name}</p>
                                  <p className="text-xs text-gray-500">{order.customer_email}</p>
                                </div>
                              </td>
                              <td className="p-2 font-medium">₹{order.total_amount ? order.total_amount.toLocaleString() : '0'}</td>
                              <td className="p-2">
                                <Badge className={getStatusColor(order.status)}>
                                  {order.status}
                                </Badge>
                              </td>
                              <td className="p-2 text-sm text-gray-600">
                                {formatDate(order.created_at)}
                              </td>
                              <td className="p-2">
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="hover:bg-blue-50 hover:text-blue-700"
                                    onClick={() => handleViewOrder(order.id)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Select 
                                    value={order.status} 
                                    onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="confirmed">Confirmed</SelectItem>
                                      <SelectItem value="shipped">Shipped</SelectItem>
                                      <SelectItem value="delivered">Delivered</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="hover:bg-red-50 hover:text-red-700"
                                    onClick={() => confirmDeleteOrder(order.id)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No orders found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <Package className="h-4 w-4 text-white" />
                      </div>
                      Product Management
                    </CardTitle>
                    <CardDescription className="text-slate-600 font-medium mt-2">Manage your product catalog</CardDescription>
                  </div>
                  <div className="flex gap-3">
                    <a href="/product-template.csv" download className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md">
                      <Download className="h-4 w-4 mr-2" />
                      Template
                    </a>
                    <Button 
                      onClick={() => setShowAddProduct(true)}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete ALL products? This action cannot be undone.')) {
                          try {
                            const response = await apiClient.deleteAllProducts();
                            if (response.success) {
                              toast({
                                title: "Success",
                                description: "All products have been deleted."
                              });
                              fetchAdminData();
                              setBulkMode('add'); // Set bulk mode to add after deleting all
                            }
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to delete all products.",
                              variant: "destructive"
                            });
                          }
                        }
                      }}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCleanupInvalidProducts}
                      disabled={bulkUploading}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-0 rounded-xl transition-all duration-200 hover:shadow-md"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cleanup Invalid Products
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Bulk Upload Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Bulk Upload Products</h3>
                      <div className="flex gap-2">
                        <a 
                          href="/product-template.csv" 
                          download
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          Download Template
                        </a>
                        <a 
                          href="/IMAGE_UPLOAD_GUIDE.md" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-green-600 hover:text-green-800 underline"
                        >
                          Image Upload Guide
                        </a>
                      </div>
                    </div>

                    {/* Bulk Image Upload */}
                    <div className="p-4 border rounded-lg mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Image className="h-5 w-5" />
                          <span className="font-medium">Step 1: Bulk Upload Product Images</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Upload product images first. The original filenames will be mapped to URLs for use in your CSV/Excel file.
                      </p>
                      <BulkImageUpload 
                        onImagesUploaded={setImageMap} 
                        onUploading={setIsUploadingImages}
                      />
                      {Object.keys(imageMap).length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm font-medium">✅ {Object.keys(imageMap).length} images uploaded</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            In your CSV/Excel file, use the original filenames in the <code>image</code> column. 
                            Example: If you uploaded "red-figure.jpg", just put "red-figure.jpg" in your spreadsheet.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Bulk Product Upload */}
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-5 w-5" />
                          <span className="font-medium">Step 2: Bulk Upload Products (CSV/Excel)</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                        <div className="md:col-span-1">
                          <input
                            type="file"
                            accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                            onChange={(e) => setBulkFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                            className="block w-full text-sm"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <Select value={bulkMode} onValueChange={(v) => setBulkMode(v as any)}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="add">Add (ignore rows with id)</SelectItem>
                              <SelectItem value="update">Update (only rows with id)</SelectItem>
                              <SelectItem value="upsert">Upsert (default)</SelectItem>
                              <SelectItem value="deleteall">Delete All Products</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-1">
                          <Button 
                            onClick={bulkMode === 'deleteall' ? handleDeleteAllProducts : handleBulkUpload} 
                            disabled={bulkUploading || (bulkMode !== 'deleteall' && (!bulkFile || isUploadingImages))} 
                            className="w-full"
                            variant={bulkMode === 'deleteall' ? "destructive" : "default"}
                          >
                            {bulkMode === 'deleteall' ? (
                              <>
                                <Trash2 className="h-4 w-5 mr-2" />
                                {bulkUploading ? 'Deleting...' : 'Delete All Products'}
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-5 mr-2" />
                                {bulkUploading ? 'Uploading...' : 'Upload'}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      {bulkSummary && (
                        <p className="text-sm text-muted-foreground mt-3">{bulkSummary}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Required columns: <code>name, category, price</code>. Optional: <code>id, originalPrice, discount, isOnSale, isNew, image, description, inStock, rating, reviews, stockQuantity</code>.
                      </p>
                    </div>
                  </div>

                  {/* Product List */}
                  <div className="overflow-x-auto">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">All Products</h3>
                        <p className="text-sm text-gray-600">
                          Total: {allProducts.length} | 
                          Valid: {allProducts.filter(p => p.name && p.price > 0 && p.stock_quantity > 0).length} | 
                          Invalid: {allProducts.filter(p => !p.name || p.price <= 0 || p.stock_quantity <= 0).length}
                        </p>
                        {allProducts.filter(p => !p.name || p.price <= 0 || p.stock_quantity <= 0).length > 0 && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                            ⚠️ Found {allProducts.filter(p => !p.name || p.price <= 0 || p.stock_quantity <= 0).length} invalid products. 
                            Use "Cleanup Invalid Products" to remove them.
                          </div>
                        )}
                      </div>
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">#</th>
                          <th className="text-left p-2">Image</th>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Category</th>
                          <th className="text-left p-2">Price</th>
                          <th className="text-left p-2">Stock</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allProducts.length > 0 ? (
                          allProducts.map((product, index) => (
                            <tr key={product.id} className="border-b hover:bg-gray-50">
                              <td className="p-2 font-medium text-gray-500">{index + 1}</td>
                              <td className="p-2">
                                <div className="relative group">
                                  {product.image && product.image !== '/placeholder-product.jpg' ? (
                                    <FallbackImage 
                                      src={product.image} 
                                      alt={product.name}
                                      className="w-12 h-12 object-cover rounded border border-gray-200"
                                      fallbackSrc="/placeholder-image.png"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                      <ImageIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                  {product.images && product.images.length > 0 && (
                                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-1 rounded-bl">
                                      +{product.images.length}
                                    </div>
                                  )}
                                  {product.images && product.images.length > 0 && (
                                    <div className="absolute hidden group-hover:flex bottom-0 left-0 right-0 justify-center p-1 bg-black bg-opacity-70 rounded-b">
                                      <span className="text-white text-xs">Multiple images</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-2 font-medium text-gray-900">{product.name || 'Unnamed Product'}</td>
                              <td className="p-2 text-sm text-gray-600">{product.category || 'Uncategorized'}</td>
                              <td className="p-2 font-semibold text-green-600">₹{product.price ? product.price.toLocaleString() : '0'}</td>
                              <td className="p-2">
                                <Badge variant={product.stock_quantity < 10 ? "destructive" : product.stock_quantity > 0 ? "secondary" : "outline"}>
                                  {product.stock_quantity}
                                </Badge>
                              </td>
                              <td className="p-2">
                                <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"}>
                                  {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                                </Badge>
                              </td>
                            <td className="p-2">
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="hover:bg-green-50 hover:text-green-700"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="hover:bg-red-50 hover:text-red-700 text-red-600 border-red-200"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )))
                        : (
                          <tr>
                            <td colSpan={8} className="p-4 text-center text-gray-500">
                              No products found. Add a product to get started.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>



          {/* Carousels Tab */}
          <TabsContent value="carousels" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <Image className="h-4 w-4 text-white" />
                      </div>
                      Carousel Management
                    </CardTitle>
                    <CardDescription className="text-slate-600 font-medium mt-2">Manage homepage and category carousels</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowAddCarousel(true)}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Carousel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {carousels.length > 0 ? (
                    carousels.map((carousel) => (
                      <div key={carousel.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{carousel.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Name: {carousel.name} • {carousel.slides.length} slides
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={carousel.isActive ? "default" : "secondary"}>
                              {carousel.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                              onClick={() => {
                                setSelectedCarousel(carousel);
                                setShowAddCarousel(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                              onClick={() => {
                                setSelectedCarouselForSlide(carousel);
                                setShowAddSlide(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Slide
                            </Button>
                          </div>
                        </div>
                        
                        {/* Slides Preview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {carousel.slides.map((slide) => (
                            <div key={slide.id} className="border rounded-lg p-3 bg-gray-50">
                              <div className="aspect-video bg-gray-200 rounded mb-2 overflow-hidden">
                                {slide.image ? (
                                  <FallbackImage 
                                    src={slide.image}
                                    alt={slide.title}
                                    fallbackSrc="/placeholder-image.png"
                                    className="w-full h-full object-cover"
                                    debug={true}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Image className="h-8 w-8" />
                                  </div>
                                )}
                              </div>
                              <h4 className="font-medium text-sm mb-1 truncate" title={slide.title}>{slide.title}</h4>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2" title={slide.subtitle}>{slide.subtitle}</p>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  Order: {slide.order}
                                </Badge>
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 w-6 p-0 hover:bg-green-50 hover:text-green-700 border-green-200"
                                    onClick={() => {
                                      setSelectedCarousel(carousel);
                                      setSelectedCarouselForSlide(carousel);
                                      setShowAddSlide(true);
                                    }}
                                    title="Edit slide"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-700 text-red-500 border-red-200"
                                    onClick={() => {
                                      if (window.confirm('Are you sure you want to delete this slide?')) {
                                        handleDeleteSlide(carousel.id, slide.id);
                                      }
                                    }}
                                    title="Delete slide"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Add New Slide Button */}
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="aspect-video flex items-center justify-center">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedCarouselForSlide(carousel);
                                  setShowAddSlide(true);
                                }}
                                className="h-full w-full flex flex-col items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-dashed border-gray-300"
                              >
                                <Plus className="h-8 w-8 mb-2" />
                                <span className="text-sm font-medium">Add Slide</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Carousel Settings */}
                        <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Auto-play:</span>
                            <span className="ml-2 font-medium">{carousel.autoPlay ? "Yes" : "No"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Interval:</span>
                            <span className="ml-2 font-medium">{carousel.interval}ms</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Height:</span>
                            <span className="ml-2 font-medium">{carousel.height}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Updated:</span>
                            <span className="ml-2 font-medium">{formatDate(carousel.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-12">
                      <Sliders className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No carousels found</h3>
                      <p className="text-sm mb-4">Create your first carousel to get started with homepage banners and promotional slides.</p>
                      <Button 
                        onClick={() => setShowAddCarousel(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Carousel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
                <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  Customer Management
                </CardTitle>
                <CardDescription className="text-slate-600 font-medium mt-2">View and manage customer accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Customer List */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Customer</th>
                          <th className="text-left p-2">Location</th>
                          <th className="text-left p-2">Orders</th>
                          <th className="text-left p-2">Total Spent</th>
                          <th className="text-left p-2">Joined</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((customer) => (
                          <tr key={customer.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              <div>
                                <p className="font-medium">{customer.full_name}</p>
                                <p className="text-xs text-gray-500">{customer.email}</p>
                              </div>
                            </td>
                            <td className="p-2 text-sm text-gray-600">
                              {customer.city}, {customer.state}
                            </td>
                            <td className="p-2">
                              <Badge variant="secondary">
                                {customer.total_orders} orders
                              </Badge>
                            </td>
                            <td className="p-2 font-medium">₹{customer.total_spent ? customer.total_spent.toLocaleString() : '0'}</td>
                            <td className="p-2 text-sm text-gray-600">
                              {formatDate(customer.created_at)}
                            </td>
                            <td className="p-2">
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="hover:bg-blue-50 hover:text-blue-700"
                                  onClick={() => handleViewCustomer(customer.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="hover:bg-green-50 hover:text-green-700"
                                  onClick={() => handleViewCustomerOrders(customer.id)}
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
                <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  Analytics & Reports
                </CardTitle>
                <CardDescription className="text-slate-600 font-medium mt-2">View detailed analytics and generate reports</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="h-12 w-12 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Analytics Dashboard</h3>
                  <p className="text-slate-600 font-medium">
                    Advanced analytics and reporting features will be implemented here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Form Modal */}
      <ProductForm
        product={selectedProduct}
        onSubmit={handleAddProduct}
        onCancel={handleCancelProductForm}
        isOpen={showAddProduct}
      />

      {/* Carousel Form Modal */}
      {showAddCarousel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedCarousel ? 'Edit Carousel' : 'Add New Carousel'}
            </h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const carouselData = {
                name: formData.get('name') as string,
                title: formData.get('title') as string,
                autoPlay: formData.get('autoPlay') === 'true',
                interval: parseInt(formData.get('interval') as string),
                height: formData.get('height') as string,
                isActive: formData.get('isActive') === 'true'
              };
              
              if (selectedCarousel) {
                handleUpdateCarousel(selectedCarousel.id, carouselData);
              } else {
                handleAddCarousel(carouselData);
              }
            }}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    name="name"
                    defaultValue={selectedCarousel?.name || ''}
                    className="w-full p-2 border rounded"
                    placeholder="hero, promo, anime-figures"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    name="title"
                    defaultValue={selectedCarousel?.title || ''}
                    className="w-full p-2 border rounded"
                    placeholder="Hero Carousel"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Auto-play</label>
                  <select name="autoPlay" className="w-full p-2 border rounded">
                    <option value="true" selected={selectedCarousel?.autoPlay}>Yes</option>
                    <option value="false" selected={!selectedCarousel?.autoPlay}>No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Interval (ms)</label>
                  <input
                    name="interval"
                    type="number"
                    defaultValue={selectedCarousel?.interval || 5000}
                    className="w-full p-2 border rounded"
                    min="1000"
                    step="500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Height</label>
                  <select name="height" className="w-full p-2 border rounded">
                    <option value="h-[400px]" selected={selectedCarousel?.height === 'h-[400px]'}>400px</option>
                    <option value="h-[500px]" selected={selectedCarousel?.height === 'h-[500px]'}>500px</option>
                    <option value="h-[600px]" selected={selectedCarousel?.height === 'h-[600px]'}>600px</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select name="isActive" className="w-full p-2 border rounded">
                    <option value="true" selected={selectedCarousel?.isActive}>Active</option>
                    <option value="false" selected={!selectedCarousel?.isActive}>Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancelCarouselForm}
                  className="hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {selectedCarousel ? 'Update' : 'Create'} Carousel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Slide Modal */}
      {showAddSlide && selectedCarouselForSlide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add New Slide to {selectedCarouselForSlide.title}</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancelSlideForm}
                className="hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <SlideForm
              onSubmit={(slideData) => handleAddSlide(selectedCarouselForSlide.id, slideData)}
              onCancel={handleCancelSlideForm}
              defaultOrder={selectedCarouselForSlide.slides.length + 1}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Order</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete order #{orderToDelete}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setOrderToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => orderToDelete && handleDeleteOrder(orderToDelete)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
