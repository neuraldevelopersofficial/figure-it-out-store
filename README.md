# 🎌 FIGURE IT OUT - Anime Collectibles Store

A full-stack e-commerce platform for anime collectibles with authentication, admin dashboard, and Razorpay payment integration.

## 🚀 **Tech Stack**

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** components
- **React Router DOM** for navigation
- **React Context** for state management

### Backend
- **Node.js** + **Express.js**
- **JWT** authentication
- **Razorpay** payment gateway
- **bcryptjs** for password hashing

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Domain**: Custom .in domain

## 📋 **Features**

✅ **User Authentication**
- Sign up/Sign in with JWT tokens
- User profiles with location data
- Password management

✅ **E-commerce Functionality**
- Product browsing and search
- Shopping cart and wishlist
- Guest browsing (no login required)
- Checkout with authentication required

✅ **Payment Integration**
- Razorpay payment gateway
- Secure payment processing
- Payment verification

✅ **Admin Dashboard**
- Product management (CRUD)
- Order management
- Customer management
- Analytics and reports

✅ **Responsive Design**
- Mobile-first approach
- Modern UI/UX
- Smooth animations

## 🛠️ **Setup Instructions**

### 1. **Frontend Setup**

```bash
# Clone the repository
git clone <your-repo-url>
cd figure-it-out-store-main

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

**Environment Variables** (`.env.local`):
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Run development server
npm run dev

# Build for production
npm run build
```

### 2. **Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env
```

**Environment Variables** (`.env`):
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_EMAIL=admin@figureitout.in
ADMIN_PASSWORD=admin123456
RAZORPAY_KEY_ID=rzp_live_RD4Ia7eTGct90w
RAZORPAY_KEY_SECRET=B18FWmc6yNaaVSQkPDULsJ2U
```

```bash
# Run development server
npm run dev

# Run production server
npm start
```

## 🔐 **Admin Access**

**Default Admin Credentials:**
- **Email**: `admin@figureitout.in`
- **Password**: `admin123456`

**To change admin credentials:**
1. Update the `.env` file in the backend
2. Restart the backend server
3. The new admin user will be created automatically

## 🚀 **Deployment**

### **Frontend on Vercel**

1. **Connect Repository:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `dist`

2. **Environment Variables:**
   ```env
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

3. **Custom Domain:**
   - Add your `.in` domain in Vercel
   - Update DNS records as instructed

### **Backend on Render**

1. **Create Web Service:**
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository

2. **Build Settings:**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

3. **Environment Variables:**
   ```env
   NODE_ENV=production
   FRONTEND_URL=https://yourdomain.in
   JWT_SECRET=your-production-jwt-secret
   ADMIN_EMAIL=admin@yourdomain.in
   ADMIN_PASSWORD=your-secure-admin-password
   RAZORPAY_KEY_ID=rzp_live_RD4Ia7eTGct90w
   RAZORPAY_KEY_SECRET=B18FWmc6yNaaVSQkPDULsJ2U
   ```

4. **Custom Domain:**
   - Add your `.in` domain in Render
   - Update DNS records as instructed

## 🔑 **Razorpay Integration**

**Live API Keys (Already Configured):**
- **Key ID**: `rzp_live_RD4Ia7eTGct90w`
- **Key Secret**: `B18FWmc6yNaaVSQkPDULsJ2U`

**Note:** The application is configured with live Razorpay keys. For testing purposes, you may want to switch to test keys.

## 📱 **API Endpoints**

### **Authentication**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### **Products**
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/search?q=query` - Search products

### **Orders**
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID

### **Razorpay**
- `POST /api/razorpay/create-order` - Create payment order
- `POST /api/razorpay/verify-payment` - Verify payment signature

### **Admin**
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/products` - Get all products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

## 🧪 **Testing**

### **Frontend Testing**
```bash
npm run lint
npm run build
```

### **Backend Testing**
```bash
cd backend
npm run dev
# Test endpoints with Postman or similar tool
```

## 🔒 **Security Features**

- **JWT Authentication** with secure tokens
- **Password Hashing** using bcryptjs
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Input Validation** on all endpoints
- **Secure Payment Processing** with Razorpay

## 📊 **Database (Future Enhancement)**

Currently using in-memory storage. For production, consider:
- **PostgreSQL** on Render
- **MongoDB Atlas**
- **Supabase** (if you change your mind)

## 🚨 **Important Notes**

1. **Change Default Passwords** before going live
2. **Update JWT Secret** in production
3. **Use Production Razorpay Keys** in production
4. **Set up SSL/HTTPS** for security
5. **Regular Backups** of your data
6. **Monitor API Usage** and performance

## 🤝 **Support**

For issues or questions:
1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure both frontend and backend are running
4. Check network connectivity and CORS settings

## 📈 **Performance Optimization**

- **Image Optimization** for product images
- **Lazy Loading** for product lists
- **Caching** strategies for API responses
- **CDN** for static assets
- **Database Indexing** when you add a database

---

**🎉 Your anime collectibles store is ready to go live!**

Remember to test thoroughly in development before deploying to production.
