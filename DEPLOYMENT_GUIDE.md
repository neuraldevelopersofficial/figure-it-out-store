# 🚀 Deployment Guide: Vercel + Render + MongoDB Atlas

## 📋 Prerequisites

- ✅ GitHub repository with your code
- ✅ MongoDB Atlas account (free tier)
- ✅ Vercel account (free tier)
- ✅ Render account (free tier)
- ✅ Custom domain (.in)

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Login with: `figureitout` / `GpdhG4lg6nKUp4cp`
3. Create new project: `figureitout-store`
4. Build new cluster:
   - **Provider**: AWS
   - **Region**: Mumbai (ap-south-1) - closest to India
   - **Cluster Tier**: M0 (Free tier)
   - **Cluster Name**: `figureitout-cluster`

### 2. Configure Database Access
1. **Database Access** → **Add New Database User**
   - Username: `figureitout`
   - Password: `GpdhG4lg6nKUp4cp`
   - Role: `Atlas admin`

### 3. Configure Network Access
1. **Network Access** → **Add IP Address**
   - **Allow Access from Anywhere**: `0.0.0.0/0`
   - This allows Render to connect

### 4. Get Connection String
1. **Clusters** → **Connect**
2. **Connect your application**
3. Copy connection string:
   ```
   mongodb+srv://figureitout:GpdhG4lg6nKUp4cp@figureitout-cluster.xxxxx.mongodb.net/figureitout-store?retryWrites=true&w=majority
   ```

## 🌐 Backend Deployment (Render)

### 1. Connect GitHub Repository
1. Go to [Render](https://render.com)
2. **New** → **Web Service**
3. Connect your GitHub repo

### 2. Configure Web Service
```
Name: figureitout-backend
Environment: Node
Build Command: npm install
Start Command: npm start
```

### 3. Environment Variables
Add these in Render dashboard:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://figureitout:GpdhG4lg6nKUp4cp@figureitout-cluster.xxxxx.mongodb.net/figureitout-store?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
ADMIN_EMAIL=admin@figureitout.in
ADMIN_PASSWORD=admin123456
FRONTEND_URL=https://figureitout.in
```

### 4. Custom Domain
1. **Settings** → **Custom Domains**
2. Add: `api.figureitout.in`
3. Update DNS records (see DNS section below)

## 🎨 Frontend Deployment (Vercel)

### 1. Connect GitHub Repository
1. Go to [Vercel](https://vercel.com)
2. **New Project**
3. Import your GitHub repo

### 2. Configure Build Settings
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3. Environment Variables
```
VITE_API_URL=https://api.figureitout.in
```

### 4. Custom Domain
1. **Settings** → **Domains**
2. Add: `figureitout.in`
3. Update DNS records

## 🔧 DNS Configuration

### DNS Records (in your domain registrar)
```
Type    Name                    Value
A       @                       Vercel IP (auto-assigned)
CNAME   www                     figureitout.in
A       api                     Render IP (auto-assigned)
```

## 📁 File Structure for Deployment

```
figure-it-out-store/
├── backend/                    # Render deployment
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   ├── routes/
│   │   ├── upload.js          # Image uploads
│   │   ├── carousels.js       # Carousel management
│   │   └── admin.js           # Admin routes
│   ├── store/                 # In-memory stores (replace with DB)
│   ├── public/
│   │   └── uploads/           # Image storage
│   ├── package.json
│   └── server.js
├── src/                       # Vercel deployment
│   ├── components/
│   ├── pages/
│   └── lib/
├── package.json
└── vite.config.ts
```

## 🖼️ Image Upload System

### Backend Storage
- **Local Storage**: `public/uploads/` (for development)
- **Production**: Consider cloud storage (AWS S3, Cloudinary)

### Image Upload Flow
1. **Admin uploads image** → `/api/upload/single`
2. **Image stored** → `public/uploads/`
3. **URL returned** → `/uploads/filename.jpg`
4. **Product created** → with image URL

### Bulk Upload
1. **CSV/Excel** with image URLs
2. **Admin uploads** → `/api/upload/multiple`
3. **Images processed** → stored locally
4. **Products created** → with local image URLs

## 🔄 Database Migration Steps

### 1. Update Stores to Use MongoDB
```javascript
// Replace in-memory stores with MongoDB calls
const { getCollection, COLLECTIONS } = require('../config/database');

// Instead of local array
const products = await getCollection(COLLECTIONS.PRODUCTS).find().toArray();
```

### 2. Update Routes
```javascript
// Example: products route
router.get('/', async (req, res) => {
  try {
    const collection = await getCollection(COLLECTIONS.PRODUCTS);
    const products = await collection.find().toArray();
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});
```

### 3. Test Locally First
```bash
# Test database connection
cd backend
npm install mongodb
npm start
```

## 🚀 Deployment Checklist

### Backend (Render)
- [ ] MongoDB Atlas cluster created
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] Database connection working
- [ ] Image uploads working
- [ ] All API endpoints responding

### Frontend (Vercel)
- [ ] Build successful
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] API calls working
- [ ] Carousels loading
- [ ] Admin dashboard accessible

### Database
- [ ] Collections created
- [ ] Indexes set up
- [ ] Sample data migrated
- [ ] Connection string secure

## 🧪 Testing Deployment

### 1. Test Backend
```bash
# Test API endpoints
curl https://api.figureitout.in/health
curl https://api.figureitout.in/api/carousels
```

### 2. Test Frontend
- Visit: `https://figureitout.in`
- Check carousels loading
- Test admin login
- Verify image uploads

### 3. Test Database
- Check MongoDB Atlas dashboard
- Verify collections created
- Test CRUD operations

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit secrets to Git
- Use Render's environment variable system
- Rotate JWT secrets regularly

### 2. Database Security
- Use MongoDB Atlas IP whitelist
- Strong passwords
- Regular backups

### 3. API Security
- Rate limiting enabled
- CORS configured properly
- JWT authentication working

## 💰 Cost Breakdown

### Free Tier Limits
- **MongoDB Atlas**: 512MB storage
- **Render**: 750 hours/month
- **Vercel**: Unlimited deployments
- **Custom Domain**: ~₹1000/year

### Upgrade Path
- **MongoDB**: $9/month for 2GB
- **Render**: $7/month for always-on
- **Vercel**: Free tier sufficient

## 🆘 Troubleshooting

### Common Issues
1. **Database Connection Failed**
   - Check MongoDB Atlas IP whitelist
   - Verify connection string
   - Check environment variables

2. **Image Uploads Not Working**
   - Verify uploads directory exists
   - Check file permissions
   - Verify multer configuration

3. **CORS Errors**
   - Check frontend URL in backend CORS config
   - Verify environment variables

4. **Build Failures**
   - Check package.json dependencies
   - Verify Node.js version
   - Check build commands

## 📞 Support

- **MongoDB Atlas**: [Documentation](https://docs.atlas.mongodb.com)
- **Render**: [Documentation](https://render.com/docs)
- **Vercel**: [Documentation](https://vercel.com/docs)

## 🎯 Next Steps

1. **Set up MongoDB Atlas cluster**
2. **Deploy backend to Render**
3. **Deploy frontend to Vercel**
4. **Configure custom domains**
5. **Test all functionality**
6. **Migrate from in-memory to database**
7. **Set up image upload system**
8. **Go live! 🚀**
