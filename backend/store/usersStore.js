const { v4: uuidv4 } = require('uuid');

// In-memory users store. Replace with DB in production.
let users = [];

// Initialize with minimal data for testing
const initializeSampleUsers = () => {
  if (users.length === 0) {
    const sampleUsers = [
      {
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
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z"
      }
    ];

    users = sampleUsers;
    console.log('👥 Test user initialized');
  }
};

// Initialize sample users on startup
initializeSampleUsers();

function nowIso() {
  return new Date().toISOString();
}

function getAll() {
  return users;
}

function getById(id) {
  return users.find(u => u.id === id);
}

function getByEmail(email) {
  return users.find(u => u.email === email);
}

function getCustomers() {
  return users.filter(u => u.role === 'customer');
}

function getAdmins() {
  return users.filter(u => u.role === 'admin');
}

function add(userData) {
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

  users.push(newUser);
  return newUser;
}

function update(id, updates) {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;

  users[index] = {
    ...users[index],
    ...updates,
    updated_at: nowIso()
  };

  return users[index];
}

function remove(id) {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;

  users.splice(index, 1);
  return true;
}

function updateUserStats(id, orderCount, orderAmount) {
  const user = getById(id);
  if (!user) return null;

  user.total_orders = (user.total_orders || 0) + orderCount;
  user.total_spent = (user.total_spent || 0) + orderAmount;
  user.updated_at = nowIso();

  return user;
}

function getStats() {
  const customers = getCustomers();
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

function search(query) {
  const q = query.toLowerCase();
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
