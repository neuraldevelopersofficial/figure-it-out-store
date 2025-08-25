import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  MapPin, 
  Heart, 
  Package, 
  Settings,
  Edit,
  Plus,
  Trash2,
  Save,
  X,
  Phone,
  Mail,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Address {
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
}

interface WishlistItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  category: string;
  added_at: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  wishlist: WishlistItem[];
  preferences: {
    notifications: {
      orderUpdates: boolean;
      promotions: boolean;
      newArrivals: boolean;
    };
    language: string;
    currency: string;
  };
  created_at: string;
  updated_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    pincode: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    isDefault: false,
    addressType: 'Home'
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  useEffect(() => {
    const handlePincodeChange = async () => {
      if (addressForm.pincode.length === 6) {
        setPincodeLoading(true);
        setPincodeError(null);
        try {
          const response = await apiClient.get(`/pincode/${addressForm.pincode}`);
          if (response.success) {
            setAddressForm(prev => ({ ...prev, city: response.city, state: response.state }));
          } else {
            setPincodeError('Invalid Pincode');
          }
        } catch (error) {
          setPincodeError('Failed to fetch pincode data');
        } finally {
          setPincodeLoading(false);
        }
      }
    };

    handlePincodeChange();
  }, [addressForm.pincode]);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/user/profile');
      if (response.success) {
        setProfile(response.user);
        setProfileForm({
          name: response.user.name || '',
          email: response.user.email || '',
          phone: response.user.phone || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast({
        title: "Error",
        description: "Failed to fetch profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      const response = await apiClient.put('/user/profile', profileForm);
      if (response.success) {
        setProfile(response.user);
        setEditingProfile(false);
        toast({
          title: "Success",
          description: "Profile updated successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const addAddress = async () => {
    try {
      const response = await apiClient.post('/user/addresses', addressForm);
      if (response.success) {
        await fetchProfile();
        setShowAddAddress(false);
        setAddressForm({
          name: '',
          phone: '',
          pincode: '',
          addressLine1: '',
          addressLine2: '',
          landmark: '',
          city: '',
          state: '',
          isDefault: false,
          addressType: 'Home'
        });
        toast({
          title: "Success",
          description: "Address added successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add address",
        variant: "destructive"
      });
    }
  };

  const updateAddress = async (addressId: string) => {
    try {
      const response = await apiClient.put(`/user/addresses/${addressId}`, addressForm);
      if (response.success) {
        await fetchProfile();
        setEditingAddress(null);
        toast({
          title: "Success",
          description: "Address updated successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update address",
        variant: "destructive"
      });
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await apiClient.delete(`/user/addresses/${addressId}`);
      if (response.success) {
        await fetchProfile();
        toast({
          title: "Success",
          description: "Address deleted successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive"
      });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await apiClient.delete(`/user/wishlist/${productId}`);
      if (response.success) {
        await fetchProfile();
        toast({
          title: "Success",
          description: "Product removed from wishlist"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from wishlist",
        variant: "destructive"
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile not found</h2>
          <p className="text-gray-600 mb-4">There was an error loading your profile.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details</CardDescription>
                      </div>
                      {!editingProfile && (
                        <Button variant="outline" onClick={() => setEditingProfile(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingProfile ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Enter your email"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={updateProfile}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => setEditingProfile(false)}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium">{profile.name}</p>
                            <p className="text-sm text-gray-500">Full Name</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium">{profile.email}</p>
                            <p className="text-sm text-gray-500">Email Address</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium">{profile.phone || 'Not provided'}</p>
                            <p className="text-sm text-gray-500">Phone Number</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Account Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Addresses</span>
                        <Badge variant="secondary">{profile.addresses.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Wishlist Items</span>
                        <Badge variant="secondary">{profile.wishlist.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Member Since</span>
                        <span className="text-sm font-medium">{formatDate(profile.created_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" className="w-full" onClick={handleLogout}>
                      Logout
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Saved Addresses</CardTitle>
                    <CardDescription>Manage your delivery addresses</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddAddress(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddAddress && (
                  <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-medium mb-4">Add New Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="addr-name">Full Name</Label>
                        <Input id="addr-name" value={addressForm.name} onChange={(e) => setAddressForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter full name" />
                      </div>
                      <div>
                        <Label htmlFor="addr-phone">Mobile number</Label>
                        <Input id="addr-phone" value={addressForm.phone} onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="10-digit mobile number" />
                      </div>
                      <div>
                        <Label htmlFor="addr-pincode">Pincode</Label>
                        <Input id="addr-pincode" value={addressForm.pincode} onChange={(e) => setAddressForm(prev => ({ ...prev, pincode: e.target.value }))} placeholder="6 digits [0-9] PIN code" maxLength={6} />
                        {pincodeLoading && <p className="text-sm text-gray-500">Fetching city/state...</p>}
                        {pincodeError && <p className="text-sm text-red-500">{pincodeError}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="addr-line1">Flat, House no., Building, Company, Apartment</Label>
                        <Input id="addr-line1" value={addressForm.addressLine1} onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine1: e.target.value }))} />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="addr-line2">Area, Street, Sector, Village</Label>
                        <Input id="addr-line2" value={addressForm.addressLine2} onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine2: e.target.value }))} />
                      </div>
                      <div>
                        <Label htmlFor="addr-landmark">Landmark</Label>
                        <Input id="addr-landmark" value={addressForm.landmark} onChange={(e) => setAddressForm(prev => ({ ...prev, landmark: e.target.value }))} placeholder="E.g. near apollo hospital" />
                      </div>
                      <div>
                        <Label htmlFor="addr-city">Town/City</Label>
                        <Input id="addr-city" value={addressForm.city} onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))} disabled />
                      </div>
                      <div>
                        <Label htmlFor="addr-state">State</Label>
                        <Input id="addr-state" value={addressForm.state} onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))} disabled />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Address Type</Label>
                        <div className="flex gap-4 mt-2">
                          {['Home', 'Work', 'Other'].map(type => (
                            <Button key={type} variant={addressForm.addressType === type ? 'secondary' : 'outline'} onClick={() => setAddressForm(prev => ({ ...prev, addressType: type }))}>{type}</Button>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-2 flex items-center gap-2">
                        <input type="checkbox" id="addr-default" checked={addressForm.isDefault} onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))} className="rounded" />
                        <Label htmlFor="addr-default">Make this my default address</Label>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={addAddress}>Save Address</Button>
                      <Button variant="outline" onClick={() => setShowAddAddress(false)}>Cancel</Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {profile.addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
                      <p className="text-gray-500 mb-4">Add your first address to make checkout faster</p>
                      <Button onClick={() => setShowAddAddress(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Address
                      </Button>
                    </div>
                  ) : (
                    profile.addresses.map((address) => (
                      <div key={address.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{address.name}</h3>
                              {address.isDefault && (
                                <Badge variant="secondary">Default</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{address.addressLine1}, {address.addressLine2}</p>
                            <p className="text-sm text-gray-600 mb-1">{address.landmark}</p>
                            <p className="text-sm text-gray-600 mb-1">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">{address.addressType}</p>
                            <p className="text-sm text-gray-600">{address.phone}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingAddress(address.id);
                                setAddressForm(address);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteAddress(address.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {editingAddress === address.id && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <Label>Full Name</Label>
                                <Input value={addressForm.name} onChange={(e) => setAddressForm(prev => ({ ...prev, name: e.target.value }))} />
                              </div>
                              <div>
                                <Label>Mobile number</Label>
                                <Input value={addressForm.phone} onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))} />
                              </div>
                              <div>
                                <Label>Pincode</Label>
                                <Input value={addressForm.pincode} onChange={(e) => setAddressForm(prev => ({ ...prev, pincode: e.target.value }))} maxLength={6} />
                                {pincodeLoading && <p className="text-sm text-gray-500">Fetching city/state...</p>}
                                {pincodeError && <p className="text-sm text-red-500">{pincodeError}</p>}
                              </div>
                              <div className="md:col-span-2">
                                <Label>Flat, House no., Building, Company, Apartment</Label>
                                <Input value={addressForm.addressLine1} onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine1: e.target.value }))} />
                              </div>
                              <div className="md:col-span-2">
                                <Label>Area, Street, Sector, Village</Label>
                                <Input value={addressForm.addressLine2} onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine2: e.target.value }))} />
                              </div>
                              <div>
                                <Label>Landmark</Label>
                                <Input value={addressForm.landmark} onChange={(e) => setAddressForm(prev => ({ ...prev, landmark: e.target.value }))} />
                              </div>
                              <div>
                                <Label>Town/City</Label>
                                <Input value={addressForm.city} disabled />
                              </div>
                              <div>
                                <Label>State</Label>
                                <Input value={addressForm.state} disabled />
                              </div>
                              <div className="md:col-span-2">
                                <Label>Address Type</Label>
                                <div className="flex gap-4 mt-2">
                                  {['Home', 'Work', 'Other'].map(type => (
                                    <Button key={type} variant={addressForm.addressType === type ? 'secondary' : 'outline'} onClick={() => setAddressForm(prev => ({ ...prev, addressType: type }))}>{type}</Button>
                                  ))}
                                </div>
                              </div>
                              <div className="md:col-span-2 flex items-center gap-2">
                                <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))} className="rounded" />
                                <Label>Set as default address</Label>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button onClick={() => updateAddress(address.id)}>Save Changes</Button>
                              <Button variant="outline" onClick={() => setEditingAddress(null)}>Cancel</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
                <CardDescription>Products you've saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                {profile.wishlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-500 mb-4">Save products you love to buy them later</p>
                    <Button onClick={() => navigate('/products')}>
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profile.wishlist.map((item) => (
                      <div key={item.productId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-medium text-lg mb-2 line-clamp-2">{item.name}</h3>
                        <p className="text-sm text-gray-500 capitalize mb-2">{item.category.replace('-', ' ')}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold">{formatPrice(item.price)}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromWishlist(item.productId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button 
                          className="w-full mt-3"
                          onClick={() => navigate(`/product/${item.productId}`)}
                        >
                          View Product
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Your order history and status</CardDescription>
                  </div>
                  <Button onClick={() => navigate('/orders')}>
                    View All Orders
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">View your orders</h3>
                  <p className="text-gray-500 mb-4">Click "View All Orders" to see your complete order history</p>
                  <Button onClick={() => navigate('/orders')}>
                    <Package className="h-4 w-4 mr-2" />
                    Go to Orders
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
