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
  Image as ImageIcon
} from "lucide-react";
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
  stock: number;
  price: number;
  image?: string; // Added image field
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
        const carouselResponse = await apiClient.get('/carousels/admin/all');
        if (carouselResponse.success) {
          setCarousels(carouselResponse.carousels);
        }
      } catch (error) {
        console.error('Failed to fetch carousels:', error);
      }
      
      // Fetch admin statistics
      const statsResponse = await apiClient.getAdminStats();
      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }

      // Fetch recent orders
      const ordersResponse = await apiClient.getAdminOrders();
      if (ordersResponse.success) {
        setRecentOrders(ordersResponse.orders.slice(0, 5)); // Get latest 5 orders for overview
        setAllOrders(ordersResponse.orders); // Store all orders
      }

      // Fetch recent products
      const productsResponse = await apiClient.getAdminProducts();
      if (productsResponse.success) {
        setRecentProducts(productsResponse.products.slice(0, 5)); // Get latest 5 products for overview
        setAllProducts(productsResponse.products); // Store all products
      }

      // Fetch customers
      const customersResponse = await apiClient.getAdminCustomers();
      if (customersResponse.success) {
        setCustomers(customersResponse.customers);
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
      let response;
      if (selectedProduct) {
        // Update existing product
        response = await apiClient.updateProduct(selectedProduct.id, product);
        if (response.success) {
          toast({
            title: "Product Updated",
            description: `Product "${product.name}" updated successfully.`,
          });
        }
      } else {
        // Create new product
        response = await apiClient.createProduct(product);
        if (response.success) {
          toast({
            title: "Product Added",
            description: `Product "${product.name}" added successfully.`,
          });
        }
      }
      
      if (response.success) {
        setShowAddProduct(false);
        setSelectedProduct(null);
        fetchAdminData(); // Refresh products list
      } else {
        toast({
          title: "Error",
          description: response.message || `Failed to ${selectedProduct ? 'update' : 'add'} product.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error with product:', error);
      toast({
        title: "Error",
        description: `Failed to ${selectedProduct ? 'update' : 'add'} product.`,
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
        const response = await apiClient.bulkUpsertProducts(bulkFile, bulkMode, imageMap);
        
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
      const response = await apiClient.updateOrderStatus(orderId, newStatus);
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
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: `Failed to update order status for #${orderId}.`,
        variant: "destructive"
      });
    }
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
      const response = await apiClient.request('/carousels/admin', {
        method: 'POST',
        body: JSON.stringify(carouselData)
      });
      
      if (response.success) {
        toast({
          title: "Carousel Created",
          description: "New carousel has been created successfully.",
        });
        setShowAddCarousel(false);
        setSelectedCarousel(null);
        fetchAdminData(); // Refresh data
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
      const response = await apiClient.request(`/carousels/admin/${carouselId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      if (response.success) {
        toast({
          title: "Carousel Updated",
          description: "Carousel has been updated successfully.",
        });
        setShowAddCarousel(false);
        setSelectedCarousel(null);
        fetchAdminData(); // Refresh data
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
      const response = await apiClient.request(`/carousels/admin/${carouselId}/slides`, {
        method: 'POST',
        body: JSON.stringify(slideData)
      });
      
      if (response.success) {
        toast({
          title: "Slide Added",
          description: "New slide has been added successfully.",
        });
        setShowAddSlide(false);
        setSelectedCarouselForSlide(null);
        fetchAdminData(); // Refresh data
      }
    } catch (error) {
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
      if (!slideData.image || !slideData.title || !slideData.subtitle) {
        toast({
          title: "Missing Information",
          description: "Please fill in image, title, and subtitle fields.",
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
                  <img 
                    src={slideData.image}
                    alt="Slide preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      const nextElement = target.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center text-gray-400 text-sm">
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Image not available</p>
                    </div>
                  </div>
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
              <label className="block text-sm font-medium mb-1">Subtitle *</label>
              <textarea
                value={slideData.subtitle}
                onChange={(e) => setSlideData(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Slide subtitle or description"
                rows={3}
                required
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.full_name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                Admin Access
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchAdminData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="carousels">Carousels</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    Active products in catalog
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    All time orders
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    All time revenue
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered customers
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2 text-yellow-600" />
                    Pending Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {stats.pendingOrders}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Orders awaiting confirmation
                  </p>
                  <Button 
                    className="mt-4" 
                    size="sm"
                    onClick={() => setActiveTab("orders")}
                  >
                    View Orders
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2 text-red-600" />
                    Low Stock Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {stats.lowStockProducts}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Products running low on stock
                  </p>
                  <Button 
                    className="mt-4" 
                    size="sm" 
                    variant="outline"
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
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No recent orders
                    </p>
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
                              {product.category} • ₹{product.price.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={product.stock < 10 ? "destructive" : "secondary"}>
                              Stock: {product.stock}
                            </Badge>
                            <Button size="sm" variant="ghost">
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

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Product Management</CardTitle>
                    <CardDescription>Manage your product catalog</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <a href="/product-template.csv" download className="inline-flex items-center px-3 py-2 border rounded-md text-sm">
                      <Download className="h-4 w-4 mr-2" />
                      Template
                    </a>
                    <Button onClick={() => setShowAddProduct(true)}>
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
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All
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
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
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
                        {allProducts.map((product) => (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              <img 
                                src={product.image || '/placeholder-product.jpg'} 
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            </td>
                            <td className="p-2 font-medium">{product.name}</td>
                            <td className="p-2 text-sm text-gray-600">{product.category}</td>
                            <td className="p-2">₹{product.price.toLocaleString()}</td>
                            <td className="p-2">
                              <Badge variant={product.stock < 10 ? "destructive" : "secondary"}>
                                {product.stock}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                                {product.stock > 0 ? "In Stock" : "Out of Stock"}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
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

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>Track and manage customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order List */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
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
                                  variant="ghost"
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

          {/* Carousels Tab */}
          <TabsContent value="carousels" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Carousel Management</CardTitle>
                    <CardDescription>Manage homepage and category carousels</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddCarousel(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Carousel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {carousels.map((carousel) => (
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
                                <img 
                                  src={slide.image.startsWith('/uploads/') ? slide.image : slide.image}
                                  alt={slide.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                    const nextElement = target.nextElementSibling as HTMLElement;
                                    if (nextElement) {
                                      nextElement.style.display = 'flex';
                                    }
                                  }}
                                />
                              ) : null}
                              <div className={`w-full h-full items-center justify-center text-gray-400 ${slide.image ? 'hidden' : 'flex'}`}>
                                <Image className="h-8 w-8" />
                              </div>
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
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
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
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
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
                              variant="ghost"
                              onClick={() => {
                                setSelectedCarouselForSlide(carousel);
                                setShowAddSlide(true);
                              }}
                              className="h-full w-full flex flex-col items-center justify-center text-gray-500 hover:text-gray-700"
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
                  ))}
                  
                  {carousels.length === 0 && (
                    <div className="text-center text-muted-foreground py-12">
                      <Sliders className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No carousels found</h3>
                      <p className="text-sm mb-4">Create your first carousel to get started with homepage banners and promotional slides.</p>
                      <Button onClick={() => setShowAddCarousel(true)}>
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
          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>View and manage customer accounts</CardDescription>
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
                            <td className="p-2 font-medium">₹{customer.total_spent.toLocaleString()}</td>
                            <td className="p-2 text-sm text-gray-600">
                              {formatDate(customer.created_at)}
                            </td>
                            <td className="p-2">
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleViewCustomer(customer.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
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
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>View detailed analytics and generate reports</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Analytics dashboard will be implemented here
                </p>
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
                <Button type="button" variant="outline" onClick={handleCancelCarouselForm}>
                  Cancel
                </Button>
                <Button type="submit">
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
              <Button variant="ghost" size="sm" onClick={handleCancelSlideForm}>
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
    </div>
  );
};

export default AdminDashboard;
