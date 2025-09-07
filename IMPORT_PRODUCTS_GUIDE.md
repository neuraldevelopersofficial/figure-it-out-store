# Importing Products Guide

## Overview
This guide explains how to import products from the Excel file (`Actionfigure.xlsx`) into the MongoDB database for the Figure It Out Store.

## Prerequisites
- Node.js installed
- Access to the MongoDB database
- The Excel file (`Actionfigure.xlsx`) with product data

## Steps to Import Products

### 1. Ensure the Excel File Format
Make sure your Excel file has the following columns:
- `ProductName`: Name of the product
- `Price`: Current price of the product
- `OriginalPrice`: Original price (for calculating discounts)
- `Category`: Product category (e.g., "Anime Figures", "Keychains")
- `Description`: Product description
- `StockQuantity`: Number of items in stock
- `ImageLink`: Main product image URL (Google Drive link)
- `AllImages`: Comma-separated list of additional image URLs (optional)
- `IsNew`: Whether the product is new (optional)
- `Rating`: Product rating (optional)
- `Reviews`: Number of reviews (optional)

### 2. Run the Import Script
From the project root directory, run:

```bash
cd backend
node import-products.js
```

This script will:
1. Read the Excel file
2. Format the data for MongoDB
3. Connect to the MongoDB database using the connection string in the `.env` file
4. Clear existing products (optional - you can modify the script to keep existing products)
5. Import the new products

### 3. Verify the Import
After running the script, you can verify the products were imported by:
1. Checking the console output for success messages
2. Visiting the website and navigating to the products page
3. Using MongoDB Atlas dashboard to view the products collection

## Deployment Process

The Figure It Out Store uses a dual deployment setup:

### Backend (Render)
- The backend API is deployed on Render
- Changes to the backend are automatically deployed when pushed to the main branch on GitHub
- The API is accessible at `https://api.figureitoutstore.in`

### Frontend (Vercel)
- The frontend is deployed on Vercel
- Changes to the frontend are automatically deployed when pushed to the main branch on GitHub
- The website is accessible at `https://figureitoutstore.in`

### Deployment Workflow

1. Make changes to your local repository
2. Test changes locally
3. Commit and push changes to GitHub
4. Render and Vercel will automatically detect the changes and deploy the updates
5. Monitor the deployment logs for any errors

### Important Notes

- Both Render and Vercel are configured for automatic deployments from the main branch
- You don't need to manually deploy after pushing changes to GitHub
- The deployment process typically takes a few minutes to complete
- You can check the deployment status on the Render and Vercel dashboards

## Troubleshooting

### Common Issues

1. **MongoDB Connection Errors**
   - Check that the MongoDB connection string in the `.env` file is correct
   - Ensure the MongoDB Atlas cluster is running and accessible

2. **Excel File Format Issues**
   - Verify the Excel file has the required columns
   - Check for any special characters or formatting issues in the Excel file

3. **Deployment Failures**
   - Check the deployment logs on Render and Vercel
   - Ensure all dependencies are properly listed in package.json
   - Verify that environment variables are correctly set in the deployment platforms