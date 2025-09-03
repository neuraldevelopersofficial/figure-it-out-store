// Test script to verify backend signature verification
import crypto from 'crypto';

console.log('🧪 Testing Backend Signature Verification...\n');

// Test data from the logs
const orderId = 'order_RDFls1zt5fsIxQ';
const paymentId = 'mock_payment_1756929708161';
const receivedSignature = '0549f46b96231812d65dc2f53e92f96a4d9092778f08250e0a365bfd28d73bef';
const keySecret = 'B18FWmc6yNaaVSQkPDULsJ2U';

console.log('📝 Test Data:');
console.log('  Order ID:', orderId);
console.log('  Payment ID:', paymentId);
console.log('  Received Signature:', receivedSignature);
console.log('  Key Secret:', keySecret.substring(0, 10) + '...');
console.log('  Key Secret Length:', keySecret.length);

// Generate the signature string
const signatureString = orderId + "|" + paymentId;
console.log('\n📝 Signature String:', signatureString);

// Generate expected signature using the same algorithm as backend
const expectedSignature = crypto
  .createHmac('sha256', keySecret)
  .update(signatureString)
  .digest('hex');

console.log('\n🔐 Expected Signature:', expectedSignature);
console.log('📏 Expected Signature Length:', expectedSignature.length);

// Compare signatures
const isMatch = expectedSignature === receivedSignature;
console.log('\n✅ Signatures Match:', isMatch);

if (isMatch) {
  console.log('🎉 Backend signature verification should work correctly!');
} else {
  console.log('❌ There is a mismatch in signature generation/verification');
  console.log('\n🔍 Debugging Info:');
  console.log('  Expected:', expectedSignature);
  console.log('  Received:', receivedSignature);
  console.log('  Match Length:', expectedSignature.length === receivedSignature.length);
  
  // Check if it's a case sensitivity issue
  const caseInsensitiveMatch = expectedSignature.toLowerCase() === receivedSignature.toLowerCase();
  console.log('  Case Insensitive Match:', caseInsensitiveMatch);
  
  // Check if it's a whitespace issue
  const trimmedMatch = expectedSignature.trim() === receivedSignature.trim();
  console.log('  Trimmed Match:', trimmedMatch);
}

console.log('\n🎯 Test completed!');
