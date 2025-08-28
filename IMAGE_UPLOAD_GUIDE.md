# Product Image Upload Guide

## Overview
This guide explains how to use the new image upload system for product images in the Figure It Out Store. The new system allows you to upload images directly to the server and reference them by filename in your product data.

## Benefits of the New System
- Faster image loading times
- No dependency on external services like Google Drive
- Simplified workflow for adding product images
- Better control over image quality and size
- Improved reliability

## How to Upload Product Images

### 1. Bulk Image Upload

1. Go to the Admin Dashboard and navigate to the "Products" tab
2. In the "Bulk Upload Products" section, find "Step 1: Bulk Upload Product Images"
3. Drag and drop your product images or click to select files
4. Wait for the upload to complete
5. Note the confirmation message showing how many images were uploaded

### 2. Using Image Filenames in CSV/Excel

After uploading your images, you can reference them in your product data by their original filenames:

#### Example:

If you uploaded an image named `red-figure.jpg`, in your CSV/Excel file:

```
name,category,price,image,allImages
Red Action Figure,Anime Figures,2999,red-figure.jpg,"red-figure-side.jpg,red-figure-back.jpg"
```

## Image Requirements

- **Supported formats**: JPG, JPEG, PNG, GIF, WEBP
- **Maximum file size**: 5MB per image
- **Recommended dimensions**: 800x800 pixels or larger
- **Maximum upload**: Up to 50 images at once

## Best Practices

1. **Use descriptive filenames**: Name your files clearly to identify the product (e.g., `naruto-figure-front.jpg`)
2. **Be consistent**: Use a naming convention for all your product images
3. **Include multiple angles**: Upload different views of each product
4. **Optimize images**: Compress images before uploading to improve performance
5. **Test first**: Upload a few images and test the import before doing a large batch

## CSV/Excel Import Process

1. **Step 1**: Upload all product images using the bulk image uploader
2. **Step 2**: Prepare your CSV/Excel file with product data, using image filenames
3. **Step 3**: Upload your CSV/Excel file and select the import mode
4. **Step 4**: Review the import summary

## Troubleshooting

### Common Issues

1. **Image not displaying**: Check that the filename in your CSV exactly matches the uploaded image filename (case-sensitive)
2. **Upload errors**: Ensure your images meet the format and size requirements
3. **Missing images**: Verify that all referenced images were uploaded before importing product data

## Support

If you encounter issues:
1. Check this guide first
2. Verify your image filenames match exactly in the CSV/Excel file
3. Contact support with specific error messages