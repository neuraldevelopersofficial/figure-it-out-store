const { v4: uuidv4 } = require('uuid');

// In-memory orders store. Replace with DB in production.
let orders = [
  {
    id: "order-001-6254481-9397433",
    userId: "user-1",
    orderNumber: "001-6254481-9397433",
    status: "delivered", // placed, processing, shipped, delivered, cancelled
    items: [
      {
        id: "1",
        productId: "prod-1",
        name: "Edward Elric Figure",
        image: "/src/assets/Edward-figure.jpg",
        price: 2999,
        quantity: 1,
        category: "anime-figures"
      }
    ],
    totalAmount: 2999,
    shippingAddress: {
      name: "Vishruti Jadhav",
      addressLine1: "123 Main Street",
      addressLine2: "Apt 4B",
      landmark: "Near City Park",
      addressType: "Home",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      phone: "+91 9876543210"
    },
    paymentMethod: "razorpay",
    paymentStatus: "completed",
    trackingNumber: "TRK123456789",
    estimatedDelivery: "2024-01-15",
    actualDelivery: "2024-01-14",
    created_at: "2024-01-10T10:30:00.000Z",
    updated_at: "2024-01-14T16:45:00.000Z"
  },
  {
    id: "order-408-8939052-9413931",
    userId: "user-1",
    orderNumber: "408-8939052-9413931",
    status: "shipped",
    items: [
      {
        id: "2",
        productId: "prod-2",
        name: "Naruto Keychain Set",
        image: "/src/assets/naruto-keychain.jpg",
        price: 599,
        quantity: 2,
        category: "keychains"
      },
      {
        id: "3",
        productId: "prod-3",
        name: "Attack on Titan Figure",
        image: "/src/assets/aot-figure.jpg",
        price: 3499,
        quantity: 1,
        category: "anime-figures"
      }
    ],
    totalAmount: 4697,
    shippingAddress: {
      name: "Vishruti Jadhav",
      addressLine1: "456 Another Ave",
      addressLine2: "",
      landmark: "Opposite the mall",
      addressType: "Work",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      phone: "+91 9876543210"
    },
    paymentMethod: "razorpay",
    paymentStatus: "completed",
    trackingNumber: "TRK987654321",
    estimatedDelivery: "2024-01-25",
    created_at: "2024-01-20T14:20:00.000Z",
    updated_at: "2024-01-22T09:15:00.000Z"
  }
];

let reviews = [
  {
    id: "review-1",
    orderId: "order-001-6254481-9397433",
    productId: "prod-1",
    userId: "user-1",
    rating: 5,
    comment: "Amazing quality figure! Highly detailed and exactly as shown in pictures.",
    created_at: "2024-01-16T12:00:00.000Z"
  }
];

function nowIso() {
  return new Date().toISOString();
}

function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random1 = Math.floor(Math.random() * 9000000) + 1000000;
  const random2 = Math.floor(Math.random() * 9000000) + 1000000;
  return `${timestamp}-${random1}-${random2}`;
}

// Order functions
function getAllOrders() {
  return orders;
}

function getOrdersByUserId(userId) {
  return orders.filter(order => order.userId === userId);
}

function getOrderById(orderId) {
  return orders.find(order => order.id === orderId);
}

function createOrder(orderData) {
  const id = uuidv4();
  const orderNumber = generateOrderNumber();
  const created_at = nowIso();
  
  const newOrder = {
    id,
    userId: orderData.userId,
    orderNumber,
    status: 'placed',
    items: orderData.items,
    totalAmount: orderData.totalAmount,
    shippingAddress: orderData.shippingAddress,
    paymentMethod: orderData.paymentMethod,
    paymentStatus: orderData.paymentStatus || 'pending',
    trackingNumber: null,
    estimatedDelivery: null,
    actualDelivery: null,
    created_at,
    updated_at: created_at
  };

  orders.push(newOrder);
  return newOrder;
}

function updateOrderStatus(orderId, status, trackingNumber = null, estimatedDelivery = null) {
  const order = getOrderById(orderId);
  if (!order) return null;

  order.status = status;
  order.updated_at = nowIso();
  
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
  if (status === 'delivered') order.actualDelivery = nowIso();

  return order;
}

// Review functions
function getReviewsByOrderId(orderId) {
  return reviews.filter(review => review.orderId === orderId);
}

function getReviewByProductAndUser(productId, userId) {
  return reviews.find(review => review.productId === productId && review.userId === userId);
}

function createReview(reviewData) {
  const id = uuidv4();
  const created_at = nowIso();
  
  const newReview = {
    id,
    orderId: reviewData.orderId,
    productId: reviewData.productId,
    userId: reviewData.userId,
    rating: reviewData.rating,
    comment: reviewData.comment,
    created_at
  };

  reviews.push(newReview);
  return newReview;
}

function updateReview(reviewId, updates) {
  const reviewIndex = reviews.findIndex(review => review.id === reviewId);
  if (reviewIndex === -1) return null;

  reviews[reviewIndex] = {
    ...reviews[reviewIndex],
    ...updates,
    updated_at: nowIso()
  };

  return reviews[reviewIndex];
}

// Invoice generation
function generateInvoice(orderId) {
  const order = getOrderById(orderId);
  if (!order) return null;

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 2000 ? 0 : 99; // Free shipping above ₹2000
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + shipping + tax;

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    date: order.created_at,
    customer: {
      name: order.shippingAddress.name,
      address: order.shippingAddress,
      phone: order.shippingAddress.phone
    },
    items: order.items.map(item => ({
      ...item,
      total: item.price * item.quantity
    })),
    summary: {
      subtotal,
      shipping,
      tax,
      total
    },
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    status: order.status
  };
}

module.exports = {
  getAllOrders,
  getOrdersByUserId,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getReviewsByOrderId,
  getReviewByProductAndUser,
  createReview,
  updateReview,
  generateInvoice
};
