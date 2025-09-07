// Test file to check if user routes can be imported
console.log('Testing user routes import...');

try {
  const userRoutes = require('./routes/user');
  console.log('✓ User routes imported successfully');
  console.log('✓ Routes file is valid');
} catch (error) {
  console.error('✗ Error importing user routes:', error.message);
  console.error('Stack trace:', error.stack);
}

try {
  const userStore = require('./store/userStore');
  console.log('✓ User store imported successfully');
} catch (error) {
  console.error('✗ Error importing user store:', error.message);
}

try {
  const ordersStore = require('./store/ordersStore');
  console.log('✓ Orders store imported successfully');
} catch (error) {
  console.error('✗ Error importing orders store:', error.message);
}
