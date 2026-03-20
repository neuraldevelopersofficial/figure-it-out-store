# Carousel Image Storage Migration

## Overview

This document outlines the migration from Google Drive image links to a local file-based image storage approach for carousel slides. This change aligns with the product image storage approach that was previously implemented.

## Changes Made

### 1. Backend Updates

#### Carousel Store

- Updated `addSlide` function to ensure image paths start with `/uploads/`
- Updated `updateSlide` function to handle image path formatting
- Both functions now automatically format image paths to use the local file storage convention

#### Migration Script

Created a new migration script (`migrate-carousel-images.js`) that:

- Processes all carousels and their slides
- Extracts filenames from Google Drive URLs
- Updates slide image paths to use the `/uploads/` directory
- Preserves slides that already use the correct format

### 2. Frontend Updates

#### Admin Dashboard

- Updated the slide preview in `AdminDashboard.tsx` to handle the new image path format
- Simplified image source handling in the slide form

## How to Use

### Running the Migration

To migrate existing carousel slide images from Google Drive links to local file paths:

```bash
cd backend
node migrate-carousel-images.js
```

This will update all carousel slides in the store to use the new format.

### Adding New Carousel Slides

The process for adding new carousel slides remains the same:

1. In the Admin Dashboard, navigate to the Carousels tab
2. Select a carousel and click "Add Slide"
3. Upload an image or provide an image URL
4. Fill in the slide details and save

The system will automatically handle the image path formatting.

## Technical Details

### Image Path Format

All carousel slide images now use the following format:

```
/uploads/filename.jpg
```

Where `filename.jpg` is either:
- The original filename from an uploaded image
- A filename extracted from a Google Drive URL
- A generated filename based on a timestamp

### Migration Logic

The migration script handles several URL formats:

1. Google Drive URLs in the format `https://drive.google.com/file/d/FILE_ID/view`
2. Google Drive URLs in the format `https://drive.google.com/uc?export=view&id=FILE_ID`
3. Other URLs with extractable filenames
4. Local paths that already use the `/uploads/` format (these are preserved)

## Benefits

- Consistent image storage approach across products and carousels
- Simplified image path handling in the frontend
- Better performance with local file storage
- Easier backup and management of image assets