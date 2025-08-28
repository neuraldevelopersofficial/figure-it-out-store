# Promotional Carousel Removal

## Overview
This document outlines the removal of the promotional carousel from the homepage of the Figure It Out store website. The promotional carousel was previously displayed between the hero section and the categories section, showing special offers and promotions.

## Changes Made

### Frontend Changes
1. **Modified `src/pages/Index.tsx`**:
   - Removed imports for `Carousel` component and `apiClient`
   - Removed state variables for `promoCarousel` and `loading`
   - Removed `useEffect` hook that fetched promotional carousel data
   - Removed the promotional carousel section from the JSX

### What Was Removed
- The promotional carousel section that displayed "Special Offers"
- API call to fetch carousel data from `/carousels/promo` endpoint
- Fallback carousel data in case of API failure

### Note
- The promotional carousel data still exists in the backend (`carouselStore.js`)
- The carousel can still be managed through the admin dashboard
- If needed in the future, the carousel can be re-added to the homepage or used on other pages

## Reason for Removal
The promotional carousel was removed to streamline the homepage design and improve user experience by reducing scrolling and focusing on the main product categories and featured products.

## Testing
After removing the promotional carousel:
1. Verify that the homepage loads correctly
2. Confirm that the transition between the hero section and categories section is smooth
3. Ensure that no console errors appear related to missing carousel components