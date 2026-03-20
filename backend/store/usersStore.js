const { v4: uuidv4 } = require('uuid');
const { getDatabase, getCollection, COLLECTIONS } = require('../config/database');

// This file now serves as a compatibility layer for MongoDB
// All operations will be performed on the database when available
// Empty array as fallback only if database is not available
let users = [];

// Initialize the users collection if needed
const initializeUsersCollection = async () => {
  try {
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    if (usersCollection) {
      // Check if we have any users
      const count = await usersCollection.countDocuments();
      if (count === 0) {
        console.log('No users found in database, initializing with test user');
        // Add a test user if the collection is empty
        await usersCollection.insertOne({
          id: "1",
          email: "test@example.com",
          full_name: "Test User",
          phone: "+91 98765 43210",
          pincode: "400001",
          address: "Test Address",
          city: "Mumbai",
          state: "Maharashtra",
          role: "customer",
          total_orders: 0,
          total_spent: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        console.log('👥 Test user initialized in database');
      }
      return;
    }
  } catch (error) {
    console.error('Error initializing users collection:', error);
  }
  
  // Fallback to in-memory if DB is not available
  if (users.length === 0) {
    users = [{
      id: "1",
      email: "test@example.com",
      full_name: "Test User",
      phone: "+91 98765 43210",
      pincode: "400001",
      address: "Test Address",
      city: "Mumbai",
      state: "Maharashtra",
      role: "customer",
      total_orders: 0,
      total_spent: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }];
    console.log('👥 Test user initialized in memory');
  }
};

// Initialize users collection on startup
initializeUsersCollection();

// Helper function for current timestamp
function nowIso() {
  return new Date().toISOString();
}

async function getAll() {
  try {
    const collection = await getCollection(COLLECTIONS.USERS);
    if (collection) {
      return await collection.find({}).toArray();
    }
  } catch (error) {
    console.error('Error getting all users from DB:', error);
  }
  
  // Fallback to in-memory if DB fails
  return users;
}

async function getById(id) {
  try {
    const collection = await getCollection(COLLECTIONS.USERS);
    if (collection) {
      return await collection.findOne({ id: id });
    }
  } catch (error) {
    console.error(`Error getting user ${id} from DB:`, error);
  }
  
  // Fallback to in-memory if DB fails
  return users.find(u => u.id === id);
}

async function getByEmail(email) {
  try {
    const collection = await getCollection(COLLECTIONS.USERS);
    if (collection) {
      return await collection.findOne({ email: email });
    }
  } catch (error) {
    console.error(`Error getting user by email ${email} from DB:`, error);
  }
  
  // Fallback to in-memory if DB fails
  return users.find(u => u.email === email);
}

async function getCustomers() {
  try {
    const collection = await getCollection(COLLECTIONS.USERS);
    if (collection) {
      return await collection.find({ role: 'customer' }).toArray();
    }
  } catch (error) {
    console.error('Error getting customers from DB:', error);
  }
  
  // Fallback to in-memory if DB fails
  return users.filter(u => u.role === 'customer');
}

async function getAdmins() {
  try {
    const collection = await getCollection(COLLECTIONS.USERS);
    if (collection) {
      return await collection.find({ role: 'admin' }).toArray();
    }
  } catch (error) {
    console.error('Error getting admins from DB:', error);
  }
  
  // Fallback to in-memory if DB fails
  return users.filter(u => u.role === 'admin');
}

async function add(userData) {
  const id = userData.id || uuidv4();
  const created_at = nowIso();
  
  const newUser = {
    id,
    email: userData.email,
    full_name: userData.full_name,
    phone: userData.phone || '',
    pincode: userData.pincode,
    address: userData.address || '',
    city: userData.city,
    state: userData.state,
    role: userData.role || 'customer',
    total_orders: userData.total_orders || 0,
    total_spent: userData.total_spent || 0,
    created_at,
    updated_at: created_at
  };

  try {
    const collection = await getCollection(COLLECTIONS.USERS);
    if (collection) {
      await collection.insertOne(newUser);
      return newUser;
    }
  } catch (error) {
    console.error('Error adding user to DB:', error);
  }
  
  // Fallback to in-memory if DB fails
  users.push(newUser);
  return newUser;
}

async function update(id, updates) {
  try {
    const collection = await getCollection(COLLECTIONS.USERS);
    if (collection) {
      const updatedUser = {
        ...updates,
        updated_at: nowIso()
      };
      
      const result = await collection.findOneAndUpdate(
        { id: id },
        { $set: updatedUser },
        { returnDocument: 'after' }
      );
      
      if (result) {
        return result;
      }
    }
  } catch (error) {
    console.error(`Error updating user ${id} in DB:`, error);
  }
  
  // Fallback to in-memory if DB fails
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;

  users[index] = {
    ...users[index],
    ...updates,
    updated_at: nowIso()
  };

  return users[index];
}

async function remove(id) {
  try {
    const collection = await getCollection(COLLECTIONS.USERS);
    if (collection) {
      const result = await collection.deleteOne({ id: id });
      return result.deletedCount > 0;
    }
  } catch (error) {
    console.error(`Error removing user ${id} from DB:`, error);
  }
  
  // Fallback to in-memory if DB fails
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;

  users.splice(index, 1);
  return true;
}

async function updateUserStats(id, orderCount, orderAmount) {
  try {
    const collection = await getCollection(COLLECTIONS.USERS);
    if (collection) {
      const user = await collection.findOne({ id: id });
      if (!user) return null;
      
      const updatedStats = {
        total_orders: (user.total_orders || 0) + orderCount,
        total_spent: (user.total_spent || 0) + orderAmount,
        updated_at: nowIso()
      };
      
      const result = await collection.findOneAndUpdate(
        { id: id },
        { $set: updatedStats },
        { returnDocument: 'after' }
      );
      
      if (result) {
        return result;
      }
    }
  } catch (error) {
    console.error(`Error updating user stats for ${id} in DB:`, error);
  }
  
  // Fallback to in-memory if DB fails
  const user = users.find(u => u.id === id);
  if (!user) return null;

  user.total_orders = (user.total_orders || 0) + orderCount;
  user.total_spent = (user.total_spent || 0) + orderAmount;
  user.updated_at = nowIso();

  return user;
}

async function getStats() {
  try {
    const collection = await getCollection(COLLECTIONS.USERS);
    if (collection) {
      // Get all customers from DB
      const customers = await collection.find({ role: 'customer' }).toArray();
      
      const totalCustomers = customers.length;
      const totalOrders = customers.reduce((sum, u) => sum + (u.total_orders || 0), 0);
      const totalRevenue = customers.reduce((sum, u) => sum + (u.total_spent || 0), 0);
      
      // Calculate average order value
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Get top customers by spending
      const topCustomers = customers
        .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
        .slice(0, 5);

      // Get customers by city
      const customersByCity = customers.reduce((acc, u) => {
        acc[u.city] = (acc[u.city] || 0) + 1;
        return acc;
      }, {});

      // Get customers by state
      const customersByState = customers.reduce((acc, u) => {
        acc[u.state] = (acc[u.state] || 0) + 1;
        return acc;
      }, {});

      return {
        totalCustomers,
        totalOrders,
        totalRevenue,
        avgOrderValue,
        topCustomers,
        customersByCity,
        customersByState
      };
    }
  } catch (error) {
    console.error('Error getting user stats from DB:', error);
  }
  
  // Fallback to in-memory if DB fails
  const customers = users.filter(u => u.role === 'customer');
  const totalCustomers = customers.length;
  const totalOrders = customers.reduce((sum, u) => sum + (u.total_orders || 0), 0);
  const totalRevenue = customers.reduce((sum, u) => sum + (u.total_spent || 0), 0);
  
  // Calculate average order value
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Get top customers by spending
  const topCustomers = customers
    .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
    .slice(0, 5);

  // Get customers by city
  const customersByCity = customers.reduce((acc, u) => {
    acc[u.city] = (acc[u.city] || 0) + 1;
    return acc;
  }, {});

  // Get customers by state
  const customersByState = customers.reduce((acc, u) => {
    acc[u.state] = (acc[u.state] || 0) + 1;
    return acc;
  }, {});

  return {
    totalCustomers,
    totalOrders,
    totalRevenue,
    avgOrderValue,
    topCustomers,
    customersByCity,
    customersByState
  };
}

async function search(query) {
  const q = query.toLowerCase();
  
  try {
    const collection = await getCollection(COLLECTIONS.USERS);
    if (collection) {
      // MongoDB text search (requires text index on these fields)
      // For simplicity, we'll use a regex search instead
      const users = await collection.find({
        $or: [
          { full_name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { city: { $regex: q, $options: 'i' } },
          { state: { $regex: q, $options: 'i' } }
        ]
      }).toArray();
      
      return users;
    }
  } catch (error) {
    console.error(`Error searching users with query "${q}" in DB:`, error);
  }
  
  // Fallback to in-memory if DB fails
  return users.filter(u =>
    u.full_name.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    u.city.toLowerCase().includes(q) ||
    u.state.toLowerCase().includes(q)
  );
}

module.exports = {
  getAll,
  getById,
  getByEmail,
  getCustomers,
  getAdmins,
  add,
  update,
  remove,
  updateUserStats,
  getStats,
  search
};
