import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Link as LinkIcon, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUpload from './ImageUpload';
import { convertGoogleDriveUrl, isValidImageUrl, testGoogleDriveImage } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  stock: number;
  image?: string;
  images?: string[];
  powerPoints?: number;
}

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (product: Omit<Product, 'id'>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    stock: '',
    image: '',
<<<<<<< HEAD
    allImages: '' // Single field for all images including main image
=======
    allImages: '', // Single field for all images including main image
    powerPoints: '50' // Default power points
>>>>>>> 214ebd2 (Initial commit: Complete anime collectibles store with admin dashboard fixes)
  });

  useEffect(() => {
    if (product) {
      // Combine main image and additional images into single field
      const allImages = [product.image, ...(product.images || [])].filter(Boolean);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category: product.category,
        description: product.description || '',
        stock: product.stock.toString(),
        image: product.image || '',
<<<<<<< HEAD
        allImages: allImages.join(', ')
=======
        allImages: allImages.join(', '),
        powerPoints: product.powerPoints?.toString() || '50'
>>>>>>> 214ebd2 (Initial commit: Complete anime collectibles store with admin dashboard fixes)
      });
    } else {
      setFormData({
        name: '',
        price: '',
        category: '',
        description: '',
        stock: '',
        image: '',
<<<<<<< HEAD
        allImages: ''
=======
        allImages: '',
        powerPoints: '50'
>>>>>>> 214ebd2 (Initial commit: Complete anime collectibles store with admin dashboard fixes)
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category || !formData.stock) {
      alert('Please fill in all required fields');
      return;
    }

    // Process all images - split comma-separated URLs and filter out empty ones
    const allImages = formData.allImages
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    // Validate image URLs
    let hasInvalidImages = false;
    allImages.forEach(url => {
      if (url && !isValidImageUrl(url)) {
        hasInvalidImages = true;
      }
    });

    if (hasInvalidImages) {
      alert('One or more image URLs are invalid. Please check your image URLs and try again.');
      return;
    }

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      description: formData.description,
<<<<<<< HEAD
      stock: parseInt(formData.stock),
=======
      stock_quantity: parseInt(formData.stock),
>>>>>>> 214ebd2 (Initial commit: Complete anime collectibles store with admin dashboard fixes)
      image: allImages[0] || '', // First image is main image
      images: allImages.slice(1), // Rest are additional images
      powerPoints: parseFloat(formData.powerPoints) || 0
    };

    onSubmit(productData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{product ? 'Edit Product' : 'Add New Product'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Anime Figures">Anime Figures</SelectItem>
                    <SelectItem value="Keychains">Keychains</SelectItem>
                    <SelectItem value="Hot Wheels">Hot Wheels</SelectItem>
                    <SelectItem value="Trending">Trending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleChange('stock', e.target.value)}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="image">Main Product Image</Label>
              <div className="space-y-3">
                {/* Drag & Drop Image Upload */}
                <ImageUpload
                  onImageUploaded={(imageUrl) => {
                    handleChange('image', imageUrl);
                    // Also update the first image in allImages if it exists
                    const allImages = formData.allImages
                      .split(',')
                      .map(url => url.trim())
                      .filter(url => url.length > 0);
                    if (allImages.length > 0) {
                      allImages[0] = imageUrl;
                      setFormData(prev => ({ ...prev, allImages: allImages.join(', ') }));
                    }
                  }}
                  className="mb-2"
                />
                
                {/* Show current main image if exists */}
                {formData.image && (
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Current Main Image</span>
                    </div>
                    <div className="aspect-square bg-white rounded border overflow-hidden max-w-32">
                      <img 
                        src={formData.image.startsWith('/uploads/') ? formData.image : convertGoogleDriveUrl(formData.image)} 
                        alt="Main product image" 
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
                          <ImageIcon className="h-6 w-6 mx-auto mb-1 opacity-50" />
                          <p>Image not available</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* All Images Section */}
                <div className="space-y-3">
                  <Label htmlFor="allImages" className="text-sm font-medium">
                    All Product Images
                  </Label>
                  <div className="space-y-2">
                    {/* Drag & Drop for Multiple Images */}
                    <ImageUpload
                      onImageUploaded={(imageUrl) => {
                        const currentImages = formData.allImages
                          .split(',')
                          .map(url => url.trim())
                          .filter(url => url.length > 0);
                        const newImages = [...currentImages, imageUrl];
                        setFormData(prev => ({ 
                          ...prev, 
                          allImages: newImages.join(', '),
                          // Update main image if it's the first image
                          image: newImages.length === 1 ? imageUrl : prev.image
                        }));
                      }}
                      multiple={true}
                      maxFiles={5}
                      className="mb-2"
                    />
                    
                    {/* Manual URL Input */}
                    <Textarea
                      id="allImages"
                      value={formData.allImages}
                      onChange={(e) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          allImages: e.target.value,
                          // Update main image to first image in the list
                          image: e.target.value.split(',')[0]?.trim() || prev.image
                        }));
                      }}
                      placeholder="Upload images above or enter URLs manually (comma separated)&#10;https://drive.google.com/file/d/IMG1_ID/view, https://drive.google.com/file/d/IMG2_ID/view"
                      rows={3}
                      className="font-mono text-sm"
                    />
                    <div className="text-xs text-gray-500">
                      💡 <strong>Tip:</strong> First image will be the main image. Use drag & drop above or enter URLs manually. All images will be shown in product details.
                    </div>
                  </div>
                  
                  {/* All Images Preview */}
                  {(() => {
                    const allImages = formData.allImages
                      .split(',')
                      .map(url => url.trim())
                      .filter(url => url.length > 0);
                    
                    return allImages.length > 0 ? (
                      <div className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">All Images Preview ({allImages.length} images)</span>
                            {allImages.length > 0 && (
                              <span className="text-xs text-blue-600">
                                First image will be main image
                              </span>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, allImages: '', image: '' }))}
                            className="h-6 px-2 text-xs"
                          >
                            Clear All
                          </Button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {allImages.map((image, index) => (
                            <div key={index} className="aspect-square bg-white rounded border overflow-hidden relative group">
                              {index === 0 && (
                                <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded z-10">
                                  Main
                                </div>
                              )}
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const newImages = allImages.filter((_, i) => i !== index);
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    allImages: newImages.join(', '),
                                    image: newImages.length > 0 ? newImages[0] : ''
                                  }));
                                }}
                                className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              <img 
                                src={image.startsWith('/uploads/') ? image : convertGoogleDriveUrl(image)} 
                                alt={`Image ${index + 1}`} 
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
                              <div className="hidden w-full h-full items-center justify-center text-gray-400 text-xs">
                                <div className="text-center">
                                  <ImageIcon className="h-6 w-6 mx-auto mb-1 opacity-50" />
                                  <p>Image not available</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {product ? 'Update Product' : 'Add Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductForm;
