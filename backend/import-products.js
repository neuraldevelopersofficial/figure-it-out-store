require('dotenv').config();
const xlsx = require('xlsx');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { connectToDatabase, getCollection, COLLECTIONS } = require('./config/database');

// Helper function to slugify text
function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to normalize category to slug
function normalizeCategoryToSlug(input) {
  const raw = slugify(input);
  const alias = {
    'anime-figure': 'anime-figures',
    'anime-figures': 'anime-figures',
    'keychain': 'keychains',
    'keychains': 'keychains'
  };
  return alias[raw] || raw;
}

// Function to read Excel file and convert to JSON
async function readExcelFile(filePath) {
  try {
    console.log(`Reading Excel file: ${filePath}`);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    console.log(`Successfully read ${data.length} products from Excel`);
    return data;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw error;
  }
}

// Function to format product data for MongoDB
function formatProductData(excelData) {
  return excelData.map(item => {
    const price = Number(item.Price) || 0;
    const originalPrice = Number(item.OriginalPrice || item.Price) || price;
    const stockQuantity = Number(item.StockQuantity || 0);
    
    return {
      id: uuidv4(),
      name: item.ProductName || '',
      price: price,
      original_price: originalPrice,
      image: item.ImageLink || '',
      images: item.AllImages ? String(item.AllImages).split(',').map(s => s.trim()).filter(Boolean) : [item.ImageLink || ''],
      category: item.Category || 'Anime Figures',
      category_slug: normalizeCategoryToSlug(item.Category || 'Anime Figures'),
      description: item.Description || '',
      stock_quantity: stockQuantity,
      in_stock: stockQuantity > 0,
      is_new: Boolean(item.IsNew),
      is_on_sale: originalPrice > price,
      discount: originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
      rating: Number(item.Rating || 4.5),
      reviews: Number(item.Reviews || 0),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
}

// Function to import products to MongoDB
async function importProductsToMongoDB(products) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get products collection
    const productsCollection = await getCollection(COLLECTIONS.PRODUCTS);
    if (!productsCollection) {
      throw new Error('Failed to get products collection. Database may not be configured.');
    }
    
    // Clear existing products (optional - remove this if you want to keep existing products)
    await productsCollection.deleteMany({});
    console.log('Cleared existing products from database');
    
    // Insert new products
    const result = await productsCollection.insertMany(products);
    console.log(`Successfully imported ${result.insertedCount} products to MongoDB`);
    
    return result;
  } catch (error) {
    console.error('Error importing products to MongoDB:', error);
    throw error;
  }
}

// Main function to run the import process
async function main() {
  try {
    // Path to Excel file (relative to this script)
    const excelFilePath = path.join(__dirname, '..', 'Actionfigure.xlsx');
    
    // Read Excel file
    const excelData = await readExcelFile(excelFilePath);
    
    // Format product data
    const formattedProducts = formatProductData(excelData);
    
    // Import to MongoDB
    await importProductsToMongoDB(formattedProducts);
    
    console.log('Product import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

// Run the import process
main();