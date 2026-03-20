# Image Upload Guide for Product Import

## Overview

This guide explains how to upload product images and reference them in your product import CSV/Excel file. The new system allows you to upload images directly through the admin dashboard and reference them by filename in your product data.

## Step 1: Bulk Image Upload

1. Navigate to the **Admin Dashboard** and select the **Products** tab
2. In the **Bulk Upload Products** section, you'll see a new **Step 1: Upload Images** area
3. Click the **Choose Files** button to select multiple product images from your computer
4. Click **Upload Images** to upload all selected images
5. Once uploaded, you'll see a list of the uploaded images with their filenames

## Step 2: Using Filenames in CSV/Excel

In your product import file, use the image filenames in the following columns:

- **ImageLink**: Enter the filename of the main product image (e.g., `product1.jpg`)
- **AllImages**: Enter a comma-separated list of filenames for additional product images (e.g., `product1.jpg,product2.jpg,product3.jpg`)

### Example:

```
ProductName,Price,ImageLink,AllImages
Luffy Figure,29.99,luffy-gear5.jpg,luffy-gear5.jpg,luffy-base.jpg,luffy-side.jpg
```

## Image Requirements

- Supported formats: JPG, JPEG, PNG, GIF, WEBP
- Maximum file size: 5MB per image
- Recommended dimensions: 800x800 pixels or larger
- Recommended aspect ratio: 1:1 (square)

## Best Practices

1. **Use descriptive filenames**: Name your files clearly to identify the product (e.g., `naruto-sage-mode.jpg` instead of `IMG_1234.jpg`)
2. **Optimize image size**: Compress images before uploading to improve site performance
3. **Maintain consistency**: Use the same image dimensions and style for all product images
4. **Upload before import**: Always upload your images before importing product data

## Troubleshooting

- **Images not appearing**: Verify that the filenames in your CSV/Excel match exactly with the uploaded files (case-sensitive)
- **Upload errors**: Ensure your images meet the format and size requirements
- **Bulk upload issues**: Try uploading fewer images at once if you encounter timeout errors

## Legacy Google Drive Links

The system still supports Google Drive links for backward compatibility. If you prefer to continue using Google Drive, you can still include full URLs in the ImageLink and AllImages columns.

## Need Help?

If you encounter any issues with the image upload process, please contact the system administrator for assistance.