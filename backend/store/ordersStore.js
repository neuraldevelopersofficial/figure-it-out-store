const { v4: uuidv4 } = require('uuid');
const { getDatabase, getCollection, COLLECTIONS } = require('../config/database');

// This file now serves as a compatibility layer for MongoDB
// All operations will be performed on the database when available
// Empty arrays as fallback only if database is not available
let orders = [];
let reviews = [];

// Initialize function that will be exported
async function init() {
  await initializeOrdersCollections();
  return true;
}

// Initialize the orders and reviews collections if needed
const initializeOrdersCollections = async () => {
  try {
    const ordersCollection = await getCollection(COLLECTIONS.ORDERS);
    const reviewsCollection = await getCollection(COLLECTIONS.REVIEWS);
    
    if (ordersCollection) {
      // Check if we have any orders
      const count = await ordersCollection.countDocuments();
      if (count === 0) {
        console.log('No orders found in database, initializing with sample orders');
        // Add sample orders if the collection is empty
        await ordersCollection.insertMany([
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
                image: "/Edward-figure.jpg",
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
                image: "/naruto-keychain.jpg",
                price: 599,
                quantity: 2,
                category: "keychains"
              },
              {
                id: "3",
                productId: "prod-3",
                name: "Attack on Titan Figure",
                image: "/aot-figure.jpg",
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
        ]);
        console.log('📦 Sample orders initialized in database');
      }
    }
    
    if (reviewsCollection) {
      // Check if we have any reviews
      const count = await reviewsCollection.countDocuments();
      if (count === 0) {
        console.log('No reviews found in database, initializing with sample review');
        // Add a sample review if the collection is empty
        await reviewsCollection.insertOne({
          id: "review-1",
          orderId: "order-001-6254481-9397433",
          productId: "prod-1",
          userId: "user-1",
          rating: 5,
          comment: "Amazing quality figure! Highly detailed and exactly as shown in pictures.",
          created_at: "2024-01-16T12:00:00.000Z"
        });
        console.log('⭐ Sample review initialized in database');
      }
      return;
    }
  } catch (error) {
    console.error('Error initializing orders/reviews collections:', error);
  }
  
  // Fallback to in-memory if DB is not available
  if (orders.length === 0) {
    orders = [
      {
        id: "order-001-6254481-9397433",
        userId: "user-1",
        orderNumber: "001-6254481-9397433",
        status: "delivered",
        items: [
          {
            id: "1",
            productId: "prod-1",
            name: "Edward Elric Figure",
            image: "/Edward-figure.jpg",
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
            image: "/naruto-keychain.jpg",
            price: 599,
            quantity: 2,
            category: "keychains"
          },
          {
            id: "3",
            productId: "prod-3",
            name: "Attack on Titan Figure",
            image: "/aot-figure.jpg",
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
    console.log('📦 Sample orders initialized in memory');
  }
  
  if (reviews.length === 0) {
    reviews = [
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
    console.log('⭐ Sample review initialized in memory');
  }
};

// Initialize orders and reviews collections on startup
initializeOrdersCollections();

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
async function getAllOrders() {
  try {
    const collection = await getCollection(COLLECTIONS.ORDERS);
    if (collection) {
      return await collection.find({}).toArray();
    }
  } catch (error) {
    console.error('Error getting all orders from DB:', error);
  }
  
  // Fallback to in-memory if DB fails
  return orders;
}

async function getOrdersByUserId(userId) {
  try {
    const collection = await getCollection(COLLECTIONS.ORDERS);
    if (collection) {
      return await collection.find({ userId: userId }).toArray();
    }
  } catch (error) {
    console.error(`Error getting orders for user ${userId} from DB:`, error);
  }
  
  // Fallback to in-memory if DB fails
  return orders.filter(order => order.userId === userId);
}

async function getOrderById(orderId) {
  try {
    const collection = await getCollection(COLLECTIONS.ORDERS);
    if (collection) {
      return await collection.findOne({ id: orderId });
    }
  } catch (error) {
    console.error(`Error getting order ${orderId} from DB:`, error);
  }
  
  // Fallback to in-memory if DB fails
  return orders.find(order => order.id === orderId);
}

async function createOrder(orderData) {
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

  try {
    const collection = await getCollection(COLLECTIONS.ORDERS);
    if (collection) {
      await collection.insertOne(newOrder);
      return newOrder;
    }
  } catch (error) {
    console.error('Error creating order in DB:', error);
  }
  
  // Fallback to in-memory if DB fails
  orders.push(newOrder);
  return newOrder;
}

async function updateOrderStatus(orderId, status, trackingNumber = null, estimatedDelivery = null) {
  try {
    const collection = await getCollection(COLLECTIONS.ORDERS);
    if (collection) {
      const order = await collection.findOne({ id: orderId });
      if (!order) return null;
      
      const updates = {
        status: status,
        updated_at: nowIso()
      };
      
      if (trackingNumber) updates.trackingNumber = trackingNumber;
      if (estimatedDelivery) updates.estimatedDelivery = estimatedDelivery;
      if (status === 'delivered') updates.actualDelivery = nowIso();
      
      const result = await collection.findOneAndUpdate(
        { id: orderId },
        { $set: updates },
        { returnDocument: 'after' }
      );
      
      if (result) {
        return result;
      }
    }
  } catch (error) {
    console.error(`Error updating order status for ${orderId} in DB:`, error);
  }
  
  // Fallback to in-memory if DB fails
  const order = orders.find(order => order.id === orderId);
  if (!order) return null;

  order.status = status;
  order.updated_at = nowIso();
  
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
  if (status === 'delivered') order.actualDelivery = nowIso();

  return order;
}

// Review functions
async function getReviewsByOrderId(orderId) {
  try {
    const collection = await getCollection(COLLECTIONS.REVIEWS);
    if (collection) {
      return await collection.find({ orderId: orderId }).toArray();
    }
  } catch (error) {
    console.error(`Error getting reviews for order ${orderId} from DB:`, error);
  }
  
  // Fallback to in-memory if DB fails
  return reviews.filter(review => review.orderId === orderId);
}

async function getReviewByProductAndUser(productId, userId) {
  try {
    const collection = await getCollection(COLLECTIONS.REVIEWS);
    if (collection) {
      return await collection.findOne({ productId: productId, userId: userId });
    }
  } catch (error) {
    console.error(`Error getting review for product ${productId} and user ${userId} from DB:`, error);
  }
  
  // Fallback to in-memory if DB fails
  return reviews.find(review => review.productId === productId && review.userId === userId);
}

async function createReview(reviewData) {
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

  try {
    const collection = await getCollection(COLLECTIONS.REVIEWS);
    if (collection) {
      await collection.insertOne(newReview);
      return newReview;
    }
  } catch (error) {
    console.error('Error creating review in DB:', error);
  }
  
  // Fallback to in-memory if DB fails
  reviews.push(newReview);
  return newReview;
}

async function updateReview(reviewId, updates) {
  try {
    const collection = await getCollection(COLLECTIONS.REVIEWS);
    if (collection) {
      const updatedReview = {
        ...updates,
        updated_at: nowIso()
      };
      
      const result = await collection.findOneAndUpdate(
        { id: reviewId },
        { $set: updatedReview },
        { returnDocument: 'after' }
      );
      
      if (result) {
        return result;
      }
    }
  } catch (error) {
    console.error(`Error updating review ${reviewId} in DB:`, error);
  }
  
  // Fallback to in-memory if DB fails
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
async function generateInvoice(orderId) {
  const order = await getOrderById(orderId);
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
  init,
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
