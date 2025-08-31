const { v4: uuidv4 } = require('uuid');

// In-memory user store. Replace with DB in production.
let users = [
  {
    id: "user-1",
    email: "vishruti@example.com",
    name: "Vishruti Jadhav",
    phone: "+91 9876543210",
    addresses: [
      {
        id: "addr-1",
        name: "Vishruti Jadhav",
        addressLine1: "D207 CD115 shreerang society",
        addressLine2: "nikam guruji marg",
        landmark: "near apollo hospital",
        addressType: "Home",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        phone: "+91 9876543210",
        isDefault: true
      }
    ],
    wishlist: [
      {
        productId: "prod-4",
        name: "One Piece Luffy Figure",
        image: "/src/assets/luffy-figure.jpg",
        price: 3299,
        category: "anime-figures",
        added_at: "2024-01-15T10:30:00.000Z"
      },
      {
        productId: "prod-5",
        name: "Dragon Ball Z Keychain",
        image: "/src/assets/dbz-keychain.jpg",
        price: 399,
        category: "keychains",
        added_at: "2024-01-18T14:20:00.000Z"
      }
    ],
    preferences: {
      notifications: {
        orderUpdates: true,
        promotions: true,
        newArrivals: false
      },
      language: "en",
      currency: "INR"
    },
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-20T12:00:00.000Z"
  }
];

function nowIso() {
  return new Date().toISOString();
}

// User functions
function getAllUsers() {
  return users;
}

function getUserById(userId) {
  return users.find(user => user.id === userId);
}

function getUserByEmail(email) {
  return users.find(user => user.email === email);
}

function addUser(user) {
  users.push(user);
  return user;
}

function createUser(userData) {
  const id = uuidv4();
  const created_at = nowIso();
  
  const newUser = {
    id,
    email: userData.email,
    name: userData.name,
    phone: userData.phone || null,
    addresses: [],
    wishlist: [],
    preferences: {
      notifications: {
        orderUpdates: true,
        promotions: true,
        newArrivals: false
      },
      language: "en",
      currency: "INR"
    },
    created_at,
    updated_at: created_at
  };

  users.push(newUser);
  return newUser;
}

function updateUser(userId, updates) {
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) return null;

  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updated_at: nowIso()
  };

  return users[userIndex];
}

// Address functions
function addAddress(userId, addressData) {
  const user = getUserById(userId);
  if (!user) return null;

  // Initialize addresses array if it doesn't exist
  if (!user.addresses) {
    user.addresses = [];
  }

  const addressId = uuidv4();
  const newAddress = {
    id: addressId,
    name: addressData.name,
    addressLine1: addressData.addressLine1,
    addressLine2: addressData.addressLine2,
    landmark: addressData.landmark,
    addressType: addressData.addressType,
    city: addressData.city,
    state: addressData.state,
    pincode: addressData.pincode,
    phone: addressData.phone,
    isDefault: addressData.isDefault || false,
    userId: userId, // Associate address with user ID
    created_at: nowIso()
  };

  // If this is set as default, make others non-default
  if (newAddress.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }

  user.addresses.push(newAddress);
  user.updated_at = nowIso();
  
  return newAddress;
}

function updateAddress(userId, addressId, updates) {
  const user = getUserById(userId);
  if (!user) return null;

  // Initialize addresses array if it doesn't exist
  if (!user.addresses) {
    user.addresses = [];
    return null; // No addresses to update
  }

  const addressIndex = user.addresses.findIndex(addr => addr.id === addressId);
  if (addressIndex === -1) return null;

  // If setting as default, make others non-default
  if (updates.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }

  // Preserve the ID and created_at when updating
  const existingAddress = user.addresses[addressIndex];
  user.addresses[addressIndex] = {
    ...existingAddress,
    ...updates,
    id: addressId, // Ensure ID is preserved
    userId: userId, // Ensure user association is preserved
    created_at: existingAddress.created_at || nowIso() // Preserve creation date
  };

  user.updated_at = nowIso();
  return user.addresses[addressIndex];
}

function deleteAddress(userId, addressId) {
  const user = getUserById(userId);
  if (!user) return false;

  const addressIndex = user.addresses.findIndex(addr => addr.id === addressId);
  if (addressIndex === -1) return false;

  user.addresses.splice(addressIndex, 1);
  user.updated_at = nowIso();
  
  return true;
}

// Wishlist functions
function addToWishlist(userId, productData) {
  const user = getUserById(userId);
  if (!user) return null;

  // Check if already in wishlist
  const existingIndex = user.wishlist.findIndex(item => item.productId === productData.productId);
  if (existingIndex !== -1) {
    return user.wishlist[existingIndex]; // Already in wishlist
  }

  const wishlistItem = {
    productId: productData.productId,
    name: productData.name,
    image: productData.image,
    price: productData.price,
    category: productData.category,
    added_at: nowIso()
  };

  user.wishlist.push(wishlistItem);
  user.updated_at = nowIso();
  
  return wishlistItem;
}

function removeFromWishlist(userId, productId) {
  const user = getUserById(userId);
  if (!user) return false;

  const itemIndex = user.wishlist.findIndex(item => item.productId === productId);
  if (itemIndex === -1) return false;

  user.wishlist.splice(itemIndex, 1);
  user.updated_at = nowIso();
  
  return true;
}

function getWishlist(userId) {
  const user = getUserById(userId);
  if (!user) return [];
  
  return user.wishlist;
}

// Preferences functions
function updatePreferences(userId, preferences) {
  const user = getUserById(userId);
  if (!user) return null;

  user.preferences = {
    ...user.preferences,
    ...preferences
  };
  user.updated_at = nowIso();
  
  return user.preferences;
}

module.exports = {
  addUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  addAddress,
  updateAddress,
  deleteAddress,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  updatePreferences
};
