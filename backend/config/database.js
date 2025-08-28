const { MongoClient } = require('mongodb');

// MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/figureitout-store';

// Database name
const DB_NAME = 'figureitout-store';

// Collections
const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CAROUSELS: 'carousels',
  CATEGORIES: 'categories'
};

let client = null;
let db = null;

// Connect to MongoDB
async function connectToDatabase() {
  try {
    if (client && db) {
      return { client, db };
    }

    // Check if we're in development mode and MongoDB Atlas is not available
    if (!process.env.MONGODB_URI && process.env.NODE_ENV !== 'production') {
      console.log('⚠️  MongoDB Atlas not configured, using in-memory stores for development');
      return { client: null, db: null };
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    
    console.log('✅ Connected to MongoDB Atlas');
    
    // Initialize collections if they don't exist
    await initializeCollections();
    
    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  Continuing with in-memory stores for development');
      return { client: null, db: null };
    }
    throw error;
  }
}

// Initialize collections and indexes
async function initializeCollections() {
  try {
    // Users collection
    const usersCollection = db.collection(COLLECTIONS.USERS);
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ role: 1 });
    
    // Products collection
    const productsCollection = db.collection(COLLECTIONS.PRODUCTS);
    await productsCollection.createIndex({ category: 1 });
    await productsCollection.createIndex({ name: 'text', description: 'text' });
    await productsCollection.createIndex({ image: 1 });
    await productsCollection.createIndex({ images: 1 });
    
    // Orders collection
    const ordersCollection = db.collection(COLLECTIONS.ORDERS);
    await ordersCollection.createIndex({ user_id: 1 });
    await ordersCollection.createIndex({ status: 1 });
    await ordersCollection.createIndex({ created_at: -1 });
    
    // Carousels collection
    const carouselsCollection = db.collection(COLLECTIONS.CAROUSELS);
    await carouselsCollection.createIndex({ name: 1 }, { unique: true });
    await carouselsCollection.createIndex({ isActive: 1 });
    
    console.log('✅ Database collections initialized');
  } catch (error) {
    console.error('❌ Collection initialization error:', error);
  }
}

// Get database instance
async function getDatabase() {
  if (!db) {
    await connectToDatabase();
  }
  return db;
}

// Get collection
async function getCollection(collectionName) {
  const database = await getDatabase();
  return database.collection(collectionName);
}

// Close database connection
async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('✅ Database connection closed');
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});

module.exports = {
  connectToDatabase,
  getDatabase,
  getCollection,
  closeDatabase,
  COLLECTIONS,
  DB_NAME
};
