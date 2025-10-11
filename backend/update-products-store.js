require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Function to update productsStore with Cloudinary URLs
function updateProductsStore() {
  try {
    console.log('🔄 Updating backend productsStore with Cloudinary URLs...');
    
    // Read the migrated JSON file
    const migratedFilePath = path.join(__dirname, '..', 'Action_figure_completed_cloudinary.json');
    
    if (!fs.existsSync(migratedFilePath)) {
      throw new Error(`Migrated JSON file not found: ${migratedFilePath}`);
    }
    
    console.log(`📄 Reading migrated JSON file: ${migratedFilePath}`);
    const migratedData = JSON.parse(fs.readFileSync(migratedFilePath, 'utf8'));
    
    if (!Array.isArray(migratedData)) {
      throw new Error('Migrated JSON file should contain an array of products');
    }
    
    console.log(`📦 Found ${migratedData.length} products to convert`);
    
    // Convert to backend store format
    const backendProducts = migratedData.map((product, index) => {
      // Extract images from the migrated data
      const mainImage = product.ImageLink || product["Image "];
      const additionalImages = product["Image "] ? product["Image "].split(',').map(url => url.trim()).filter(Boolean) : [];
      
      // Use main image as primary image, and all images as gallery
      const allImages = [mainImage, ...additionalImages].filter(Boolean);
      const uniqueImages = [...new Set(allImages)]; // Remove duplicates
      
      // Generate UUID-like ID
      const id = `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        id: id,
        name: product.ProductName || product.name || `Product ${index + 1}`,
        price: parseInt(product.Price) || 0,
        original_price: parseInt(product.Price) || 0,
        image: uniqueImages[0] || '/placeholder-product.jpg',
        images: uniqueImages.length > 0 ? uniqueImages : ['/placeholder-product.jpg'],
        category: product.Category || 'Anime Figures',
        category_slug: (product.Category || 'Anime Figures').toLowerCase().replace(/\s+/g, '-'),
        rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
        reviews: Math.floor(Math.random() * 200) + 50, // Random reviews between 50-250
        is_new: Math.random() > 0.7, // 30% chance of being new
        is_on_sale: Math.random() > 0.6, // 40% chance of being on sale
        discount: Math.random() > 0.6 ? Math.floor(Math.random() * 30) + 10 : 0, // 10-40% discount if on sale
        description: product.description || product.Description || `Premium quality ${product.ProductName || product.name || 'anime figure'}. This highly detailed collectible features authentic design and vibrant colors. Perfect for any anime fan's collection.`,
        in_stock: parseInt(product.Stock) > 0,
        stock_quantity: parseInt(product.Stock) || 0,
        power_points: product.powerPoints || Math.floor(Math.random() * 50) + 50, // Random power points between 50-100
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });
    
    // Create the updated productsStore file content
    const storeContent = `const { v4: uuidv4 } = require('uuid');
const { getDatabase, getCollection, COLLECTIONS } = require('../config/database');

// Updated products with Cloudinary URLs (${new Date().toISOString()})
// This file now serves as a compatibility layer for MongoDB
// All operations will be performed on the database when available
// Empty array as fallback only if database is not available
let products = ${JSON.stringify(backendProducts, null, 2)};

// MongoDB operations
async function getProductsCollection() {
  try {
    const db = await getDatabase();
    if (!db) return null;
    return await getCollection(COLLECTIONS.PRODUCTS);
  } catch (e) {
    return null;
  }
}

// Get all products
async function getAllProducts() {
  try {
    const collection = await getProductsCollection();
    if (collection) {
      const docs = await collection.find({}).toArray();
      return docs.map(mapDbProductToApi);
    }
  } catch (e) {
    console.error('Error fetching products from database:', e);
  }
  
  // Fallback to in-memory store
  return products;
}

// Get product by ID
async function getProductById(id) {
  try {
    const collection = await getProductsCollection();
    if (collection) {
      const doc = await collection.findOne({ id: id });
      return doc ? mapDbProductToApi(doc) : null;
    }
  } catch (e) {
    console.error('Error fetching product from database:', e);
  }
  
  // Fallback to in-memory store
  return products.find(p => p.id === id) || null;
}

// Get products by category
async function getProductsByCategory(category) {
  try {
    const collection = await getProductsCollection();
    if (collection) {
      const docs = await collection.find({ category: category }).toArray();
      return docs.map(mapDbProductToApi);
    }
  } catch (e) {
    console.error('Error fetching products by category from database:', e);
  }
  
  // Fallback to in-memory store
  return products.filter(p => p.category === category);
}

// Search products
async function searchProducts(query) {
  try {
    const collection = await getProductsCollection();
    if (collection) {
      const docs = await collection.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ]
      }).toArray();
      return docs.map(mapDbProductToApi);
    }
  } catch (e) {
    console.error('Error searching products in database:', e);
  }
  
  // Fallback to in-memory store
  const lowercaseQuery = query.toLowerCase();
  return products.filter(p => 
    p.name.toLowerCase().includes(lowercaseQuery) ||
    p.description.toLowerCase().includes(lowercaseQuery) ||
    p.category.toLowerCase().includes(lowercaseQuery)
  );
}

// Add new product
async function addProduct(productData) {
  try {
    const collection = await getProductsCollection();
    if (collection) {
      const newProduct = {
        ...productData,
        id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await collection.insertOne(newProduct);
      return mapDbProductToApi(newProduct);
    }
  } catch (e) {
    console.error('Error adding product to database:', e);
  }
  
  // Fallback to in-memory store
  const newProduct = {
    ...productData,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  products.push(newProduct);
  return newProduct;
}

// Update product
async function updateProduct(id, updateData) {
  try {
    const collection = await getProductsCollection();
    if (collection) {
      const updatedProduct = {
        ...updateData,
        id: id,
        updated_at: new Date().toISOString()
      };
      const result = await collection.updateOne({ id: id }, { $set: updatedProduct });
      if (result.modifiedCount > 0) {
        return mapDbProductToApi(updatedProduct);
      }
      return null;
    }
  } catch (e) {
    console.error('Error updating product in database:', e);
  }
  
  // Fallback to in-memory store
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = {
      ...products[index],
      ...updateData,
      id: id,
      updated_at: new Date().toISOString()
    };
    return products[index];
  }
  return null;
}

// Delete product
async function deleteProduct(id) {
  try {
    const collection = await getProductsCollection();
    if (collection) {
      const result = await collection.deleteOne({ id: id });
      return result.deletedCount > 0;
    }
  } catch (e) {
    console.error('Error deleting product from database:', e);
  }
  
  // Fallback to in-memory store
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products.splice(index, 1);
    return true;
  }
  return false;
}

// Helper function to map database product to API format
function mapDbProductToApi(doc) {
  if (!doc) return null;
  return {
    id: doc.id || doc._id,
    name: doc.name || '',
    price: doc.price || 0,
    original_price: doc.original_price || doc.price || 0,
    image: doc.image || '/placeholder-product.jpg',
    images: Array.isArray(doc.images) ? doc.images : [doc.image || '/placeholder-product.jpg'],
    category: doc.category || 'Anime Figures',
    category_slug: doc.category_slug || (doc.category || 'Anime Figures').toLowerCase().replace(/\\s+/g, '-'),
    rating: doc.rating || 4.5,
    reviews: doc.reviews || 0,
    is_new: doc.is_new || false,
    is_on_sale: doc.is_on_sale || false,
    discount: doc.discount || 0,
    description: doc.description || '',
    in_stock: doc.in_stock !== undefined ? doc.in_stock : (doc.stock_quantity > 0),
    stock_quantity: doc.stock_quantity || 0,
    power_points: doc.power_points || 0,
    created_at: doc.created_at || new Date().toISOString(),
    updated_at: doc.updated_at || new Date().toISOString()
  };
}

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  products // Export for backward compatibility
};
`;
    
    // Write the updated productsStore file
    const outputPath = path.join(__dirname, 'store', 'productsStore.js');
    fs.writeFileSync(outputPath, storeContent);
    
    // Create a backup of the original file
    const backupPath = path.join(__dirname, 'store', 'productsStore.backup.js');
    const originalPath = path.join(__dirname, 'store', 'productsStore.js');
    
    if (fs.existsSync(originalPath)) {
      fs.copyFileSync(originalPath, backupPath);
      console.log(`💾 Backup created: ${backupPath}`);
    }
    
    console.log('✅ Successfully updated productsStore!');
    console.log(`📄 Updated productsStore file: ${outputPath}`);
    console.log(`📦 Converted ${backendProducts.length} products`);
    
    // Show some statistics
    const categories = [...new Set(backendProducts.map(p => p.category))];
    const onSaleCount = backendProducts.filter(p => p.is_on_sale).length;
    const newCount = backendProducts.filter(p => p.is_new).length;
    const inStockCount = backendProducts.filter(p => p.in_stock).length;
    const cloudinaryImages = backendProducts.filter(p => p.image.includes('cloudinary.com')).length;
    
    console.log('\n📊 Product Statistics:');
    console.log(`   Categories: ${categories.join(', ')}`);
    console.log(`   On Sale: ${onSaleCount} products`);
    console.log(`   New Products: ${newCount} products`);
    console.log(`   In Stock: ${inStockCount} products`);
    console.log(`   Out of Stock: ${backendProducts.length - inStockCount} products`);
    console.log(`   Cloudinary Images: ${cloudinaryImages} products`);
    
    return backendProducts;
    
  } catch (error) {
    console.error('❌ Update failed:', error);
    throw error;
  }
}

// Run update if this file is executed directly
if (require.main === module) {
  updateProductsStore()
    .then(() => {
      console.log('✅ ProductsStore update completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ ProductsStore update failed:', error);
      process.exit(1);
    });
}

module.exports = { updateProductsStore };
