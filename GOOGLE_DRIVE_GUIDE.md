# Google Drive Image Integration Guide

## Overview
Your store now supports Google Drive links for product images! This means you can:
- Upload product photos to Google Drive
- Share the links in your product data
- Images will automatically display in the store

## How to Use Google Drive Links

### 1. Upload Images to Google Drive
1. Go to [Google Drive](https://drive.google.com)
2. Create a folder for your store images (e.g., "Figure Store Products")
3. Upload your product images to this folder

### 2. Get Shareable Links
1. Right-click on an image in Google Drive
2. Select "Share" or "Get link"
3. Click "Copy link"
4. The link will look like: `https://drive.google.com/file/d/FILE_ID_HERE/view?usp=sharing`

### 3. Use in Product Data
You can use Google Drive links in several ways:

#### Option A: Full Shareable Link
```
https://drive.google.com/file/d/1ABC123DEF456GHI789/view?usp=sharing
```

#### Option B: Just the File ID
```
1ABC123DEF456GHI789
```

#### Option C: Direct View Link
```
https://drive.google.com/file/d/1ABC123DEF456GHI789/view
```

## Supported Link Formats

The system automatically converts these formats to displayable images:

✅ **Full sharing links**: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
✅ **Direct view links**: `https://drive.google.com/file/d/FILE_ID/view`
✅ **Open links**: `https://drive.google.com/open?id=FILE_ID`
✅ **File IDs only**: `1ABC123DEF456GHI789`

## Image Requirements

- **Format**: JPG, PNG, GIF, WebP
- **Size**: Recommended under 10MB for fast loading
- **Aspect Ratio**: Square (1:1) works best for product cards
- **Quality**: High quality (at least 800x800 pixels)

## Example Product Data

### CSV Format
```csv
name,category,price,image,description
Luffy Figure,Anime Figures,4299,https://drive.google.com/file/d/1ABC123DEF456GHI789/view,Premium One Piece figure
Goku Keychain,Keychains,599,1ABC123DEF456GHI789,Dragon Ball Z keychain
```

### Single Product (Admin Dashboard)
- **Image URL**: `https://drive.google.com/file/d/1ABC123DEF456GHI789/view`
- **Or just**: `1ABC123DEF456GHI789`

## Testing Your Google Drive Links

Before using Google Drive links in your products, test them to ensure they work correctly:

### Use Our Image Tester Tool
Visit: `/test-google-drive.html` in your browser to test your Google Drive links.

This tool will:
- Convert your Google Drive links to direct URLs
- Test if the image is publicly accessible
- Show a preview of the image
- Provide specific error messages if something is wrong

### Manual Testing
1. Copy your Google Drive link
2. Open it in an incognito/private browser window
3. You should see the image directly, not a sign-in page
4. If you see "Sign in", the permissions need to be fixed

## Troubleshooting

### Images Not Displaying?

#### Common Issue: "Sign in" Page Appears
If you see a Google sign-in page instead of your image, this means the image permissions are not set correctly.

**Quick Fix:**
1. Go to Google Drive and find your image
2. Right-click the image → Select "Share"
3. Click "Change to anyone with the link"
4. Set permission to "Viewer" (not "Editor")
5. **Important**: Make sure "Anyone with the link" is selected
6. Click "Done"

**Test your link:**
- Open the link in an incognito/private browser window
- You should see the image directly, not a sign-in page

#### Other Common Issues:
1. **Check permissions**: Make sure the image is set to "Anyone with the link can view"
2. **Verify link format**: Use one of the supported formats above
3. **Test the link**: Open the link in an incognito browser window

### Setting Google Drive Permissions
1. Right-click the image in Google Drive
2. Select "Share"
3. Click "Change to anyone with the link"
4. Set to "Viewer"
5. Click "Done"

### Image Quality Issues?
- Use original size images (don't resize before uploading)
- Ensure images are at least 800x800 pixels
- Use JPG format for photos, PNG for graphics with transparency

## Best Practices

1. **Organize**: Create folders for different product categories
2. **Naming**: Use descriptive names like "luffy-gear5-figure.jpg"
3. **Backup**: Keep original images on your computer
4. **Consistency**: Use similar image sizes and aspect ratios
5. **Testing**: Always test links before bulk uploading

## Bulk Upload Tips

1. **Prepare your CSV**: Use the template provided in `public/product-template.csv`
2. **Test a few images**: Upload 2-3 products first to verify everything works
3. **Check permissions**: Ensure all images are publicly viewable
4. **Use consistent formats**: Pick one link format and stick with it

## Support

If you encounter issues:
1. Check this guide first
2. Verify image permissions in Google Drive
3. Test the image link in an incognito browser
4. Contact support with specific error messages

## Example Working Links

Here are examples of properly formatted Google Drive links:

```
✅ https://drive.google.com/file/d/1ABC123DEF456GHI789/view
✅ https://drive.google.com/open?id=1ABC123DEF456GHI789
✅ 1ABC123DEF456GHI789
```

**Note**: Replace `1ABC123DEF456GHI789` with your actual Google Drive file ID.
