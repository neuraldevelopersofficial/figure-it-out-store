# Image Storage Migration Guide

## Overview

This document outlines the migration from Google Drive image links to a local file-based image storage approach for the Figure It Out Store. The migration includes updates to the MongoDB schema, a migration script for existing data, and changes to the import process.

## Changes Made

### 1. MongoDB Schema Updates

The MongoDB schema has been updated to include indexes for image fields:

```javascript
// Products collection
const productsCollection = db.collection(COLLECTIONS.PRODUCTS);
await productsCollection.createIndex({ category: 1 });
await productsCollection.createIndex({ name: 'text', description: 'text' });
await productsCollection.createIndex({ image: 1 });
await productsCollection.createIndex({ images: 1 });
```

These indexes improve query performance when searching or filtering products by image fields.

### 2. Migration Script

A migration script (`migrate-images.js`) has been created to update existing product records in the database:

```bash
# Run the migration script
cd backend
node migrate-images.js
```

The script performs the following actions:

- Identifies products with Google Drive image links
- Extracts filenames from the links
- Updates the image paths to use the new `/uploads/` format
- Preserves backward compatibility for existing links

### 3. Import Process Updates

The product import process has been updated to support the new image storage approach:

- CSV/Excel imports now accept filenames instead of Google Drive links
- The `formatProductData` function in `import-products.js` has been modified to handle filenames
- The bulk upload process now includes a step for uploading images before importing product data

## How to Use the New System

### For New Products

1. Upload images using the bulk image upload feature in the admin dashboard
2. Reference the uploaded images by filename in your CSV/Excel import file
3. Import the product data using the bulk upload feature

### For Existing Products

1. Run the migration script to update existing product records
2. Verify that the images are displaying correctly in the admin dashboard and on the website
3. For any missing images, upload them using the bulk image upload feature

## Benefits of the New Approach

- **Simplified workflow**: No need to upload images to Google Drive and copy links
- **Better performance**: Images are served directly from the application server
- **Improved reliability**: No dependency on external services for image hosting
- **Enhanced security**: Better control over image access and permissions
- **Easier maintenance**: All product data and images are managed in one place

## Technical Details

### Image Storage Location

Images are stored in the `public/uploads/` directory on the server. In production, consider using a cloud storage solution like AWS S3 or Cloudinary for better scalability.

### Image URL Format

Image URLs now follow this format: `/uploads/filename.jpg`

### Backward Compatibility

The system maintains backward compatibility with Google Drive links for existing data. The migration script preserves the original links while adding the new format.

## Troubleshooting

### Common Issues

1. **Images not displaying**: Ensure that the image files exist in the `public/uploads/` directory
2. **Migration errors**: Check the console output for specific error messages
3. **Import errors**: Verify that the filenames in your CSV/Excel file match the uploaded image filenames

### Support

For assistance with the migration process, contact the development team.