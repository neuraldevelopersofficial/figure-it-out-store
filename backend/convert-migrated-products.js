require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Function to convert migrated JSON to frontend products format
function convertMigratedProducts() {
  try {
    console.log('🔄 Converting migrated products to frontend format...');
    
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
    
    // Convert to frontend format
    const frontendProducts = migratedData.map((product, index) => {
      // Extract images from the migrated data
      const mainImage = product.ImageLink || product["Image "];
      const additionalImages = product["Image "] ? product["Image "].split(',').map(url => url.trim()).filter(Boolean) : [];
      
      // Use main image as primary image, and all images as gallery
      const allImages = [mainImage, ...additionalImages].filter(Boolean);
      const uniqueImages = [...new Set(allImages)]; // Remove duplicates
      
      return {
        id: (index + 1).toString(),
        name: product.ProductName || product.name || `Product ${index + 1}`,
        price: parseInt(product.Price) || 0,
        originalPrice: parseInt(product.Price) || 0,
        image: uniqueImages[0] || '/placeholder-product.jpg',
        images: uniqueImages.length > 0 ? uniqueImages : ['/placeholder-product.jpg'],
        category: product.Category || 'Anime Figures',
        rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
        reviews: Math.floor(Math.random() * 200) + 50, // Random reviews between 50-250
        isNew: Math.random() > 0.7, // 30% chance of being new
        isOnSale: Math.random() > 0.6, // 40% chance of being on sale
        discount: Math.random() > 0.6 ? Math.floor(Math.random() * 30) + 10 : 0, // 10-40% discount if on sale
        description: product.description || product.Description || `Premium quality ${product.ProductName || product.name || 'anime figure'}. This highly detailed collectible features authentic design and vibrant colors. Perfect for any anime fan's collection.`,
        inStock: parseInt(product.Stock) > 0,
        powerPoints: product.powerPoints || Math.floor(Math.random() * 50) + 50 // Random power points between 50-100
      };
    });
    
    // Create the TypeScript file content
    const tsContent = `import { Product } from '@/context/StoreContext';

// Migrated products from Cloudinary (${new Date().toISOString()})
export const products: Product[] = ${JSON.stringify(frontendProducts, null, 2)};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.isNew || product.isOnSale).slice(0, 8);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery)
  );
};
`;
    
    // Write the new products file
    const outputPath = path.join(__dirname, '..', 'src', 'data', 'products.ts');
    fs.writeFileSync(outputPath, tsContent);
    
    console.log('✅ Successfully converted migrated products!');
    console.log(`📄 Updated products file: ${outputPath}`);
    console.log(`📦 Converted ${frontendProducts.length} products`);
    
    // Show some statistics
    const categories = [...new Set(frontendProducts.map(p => p.category))];
    const onSaleCount = frontendProducts.filter(p => p.isOnSale).length;
    const newCount = frontendProducts.filter(p => p.isNew).length;
    const inStockCount = frontendProducts.filter(p => p.inStock).length;
    
    console.log('\n📊 Product Statistics:');
    console.log(`   Categories: ${categories.join(', ')}`);
    console.log(`   On Sale: ${onSaleCount} products`);
    console.log(`   New Products: ${newCount} products`);
    console.log(`   In Stock: ${inStockCount} products`);
    console.log(`   Out of Stock: ${frontendProducts.length - inStockCount} products`);
    
    // Create a backup of the original file
    const backupPath = path.join(__dirname, '..', 'src', 'data', 'products.backup.ts');
    const originalPath = path.join(__dirname, '..', 'src', 'data', 'products.ts');
    
    if (fs.existsSync(originalPath)) {
      fs.copyFileSync(originalPath, backupPath);
      console.log(`💾 Backup created: ${backupPath}`);
    }
    
    return frontendProducts;
    
  } catch (error) {
    console.error('❌ Conversion failed:', error);
    throw error;
  }
}

// Run conversion if this file is executed directly
if (require.main === module) {
  convertMigratedProducts()
    .then(() => {
      console.log('✅ Product conversion completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Product conversion failed:', error);
      process.exit(1);
    });
}

module.exports = { convertMigratedProducts };
