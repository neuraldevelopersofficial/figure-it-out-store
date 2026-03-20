const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { getDatabase, getCollection, COLLECTIONS } = require('../config/database');

const userStore = require('../store/userStore');

// Validate JWT secret is configured
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET not configured in environment variables - authentication will fail');
}

async function getUsersCollection() {
  try {
    const db = await getDatabase();
    if (!db) return null;
    return await getCollection(COLLECTIONS.USERS);
  } catch (e) {
    return null;
  }
}

// Initialize admin user if not exists
const initializeAdmin = () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@figureitout.in';
  let adminUser = userStore.getUserByEmail(adminEmail);

  if (!adminUser) {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    
    const newAdminData = {
      id: uuidv4(),
      email: adminEmail,
      password: hashedPassword,
      full_name: 'Admin User',
      role: 'admin',
      pincode: '400001',
      city: 'Mumbai',
      state: 'Maharashtra',
      addresses: [],
      wishlist: [],
      preferences: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    adminUser = userStore.addUser(newAdminData);
    // Persist to MongoDB if available
    getUsersCollection().then(async (col) => {
      if (col) {
        await col.updateOne({ email: adminEmail }, { $setOnInsert: newAdminData }, { upsert: true });
      }
    }).catch(() => {});
    console.log('🔐 Admin user created:', adminEmail);
  } else {
    console.log('ℹ️ Admin user already exists:', adminEmail);
  }
};

// Initialize admin on startup
initializeAdmin();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// User registration
router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name, phone, pincode, address, city, state } = req.body;

    // Validation
    if (!email || !password || !full_name || !pincode || !city || !state) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const col = await getUsersCollection();
    let existingUser = col ? await col.findOne({ email }) : userStore.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      full_name,
      phone: phone || '',
      pincode,
      address: address || '',
      city,
      state,
      role: 'customer',
      addresses: [],
      wishlist: [],
      preferences: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (col) {
      await col.insertOne({ ...newUser });
    } else {
      userStore.addUser(newUser);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const col = await getUsersCollection();
    const user = col ? await col.findOne({ email }) : userStore.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const col = await getUsersCollection();
    const user = col ? await col.findOne({ id: req.user.id }) : userStore.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { full_name, phone, pincode, address, city, state } = req.body;
    
    const col = await getUsersCollection();
    const user = col ? await col.findOne({ id: req.user.id }) : userStore.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields
    const updates = {
        full_name,
        phone,
        pincode,
        address,
        city,
        state
    };

    let updatedUser;
    if (col) {
      const result = await col.findOneAndUpdate(
        { id: req.user.id },
        { $set: { ...updates, updated_at: new Date().toISOString() } },
        { returnDocument: 'after' }
      );
      updatedUser = result.value;
    } else {
      updatedUser = userStore.updateUser(req.user.id, updates);
    }

    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const col = await getUsersCollection();
    const user = col ? await col.findOne({ id: req.user.id }) : userStore.getUserById(req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    if (col) {
      await col.updateOne({ id: req.user.id }, { $set: { password: hashedNewPassword, updated_at: new Date().toISOString() } });
    } else {
      userStore.updateUser(req.user.id, { password: hashedNewPassword });
    }

    res.json({ success: true, message: 'Password changed successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Admin setup endpoint - DISABLED for security
// This endpoint has been removed to prevent credential exposure
// Admin credentials should only be accessed via secure environment variables

module.exports = router;
