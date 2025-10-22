const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const carouselStore = require('../store/carouselStore');

// Middleware to verify JWT token and check admin role
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Public routes - no authentication required
// Get all active carousels
router.get('/', async (req, res) => {
  try {
    const carousels = await carouselStore.getActive();
    res.json({
      success: true,
      carousels
    });
  } catch (error) {
    console.error('Carousels fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch carousels' });
  }
});

// Note: Admin routes must be defined BEFORE generic parameter routes to avoid conflicts

// Admin routes - require authentication
// Get all carousels (including inactive)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const carousels = await carouselStore.getAll();
    res.json({
      success: true,
      carousels
    });
  } catch (error) {
    console.error('Admin carousels fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch carousels' });
  }
});

// Create new carousel
router.post('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, title, slides, autoPlay, interval, height, isActive } = req.body;

    if (!name || !title) {
      return res.status(400).json({ error: 'Name and title are required' });
    }

    // Check if carousel with this name already exists
    const existingCarousel = await carouselStore.getByName(name);
    if (existingCarousel) {
      return res.status(400).json({ error: 'Carousel with this name already exists' });
    }

    const newCarousel = await carouselStore.add({
      name,
      title,
      slides: slides || [],
      autoPlay: autoPlay !== undefined ? autoPlay : true,
      interval: interval || 5000,
      height: height || "h-[400px]",
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      message: 'Carousel created successfully',
      carousel: newCarousel
    });

  } catch (error) {
    console.error('Carousel creation error:', error);
    res.status(500).json({ error: 'Failed to create carousel' });
  }
});

// Update carousel
router.put('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const updatedCarousel = await carouselStore.update(id, updates);
    if (!updatedCarousel) {
      return res.status(404).json({ error: 'Carousel not found' });
    }

    res.json({
      success: true,
      message: 'Carousel updated successfully',
      carousel: updatedCarousel
    });

  } catch (error) {
    console.error('Carousel update error:', error);
    res.status(500).json({ error: 'Failed to update carousel' });
  }
});

// Delete carousel
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const removed = await carouselStore.remove(id);
    if (!removed) {
      return res.status(404).json({ error: 'Carousel not found' });
    }

    res.json({
      success: true,
      message: 'Carousel deleted successfully'
    });

  } catch (error) {
    console.error('Carousel deletion error:', error);
    res.status(500).json({ error: 'Failed to delete carousel' });
  }
});

// Add slide to carousel
router.post('/admin/:id/slides', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const slideData = req.body;

    if (!slideData.image) {
      return res.status(400).json({ error: 'Image is required for slides' });
    }

    const newSlide = await carouselStore.addSlide(id, slideData);
    if (!newSlide) {
      return res.status(404).json({ error: 'Carousel not found' });
    }

    res.status(201).json({
      success: true,
      message: 'Slide added successfully',
      slide: newSlide
    });

  } catch (error) {
    console.error('Slide addition error:', error);
    res.status(500).json({ error: 'Failed to add slide' });
  }
});

// Update slide
router.put('/admin/:id/slides/:slideId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id, slideId } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const updatedSlide = await carouselStore.updateSlide(id, slideId, updates);
    if (!updatedSlide) {
      return res.status(404).json({ error: 'Carousel or slide not found' });
    }

    res.json({
      success: true,
      message: 'Slide updated successfully',
      slide: updatedSlide
    });

  } catch (error) {
    console.error('Slide update error:', error);
    res.status(500).json({ error: 'Failed to update slide' });
  }
});

// Delete slide
router.delete('/admin/:id/slides/:slideId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id, slideId } = req.params;

    const removed = await carouselStore.removeSlide(id, slideId);
    if (!removed) {
      return res.status(404).json({ error: 'Carousel or slide not found' });
    }

    res.json({
      success: true,
      message: 'Slide deleted successfully'
    });

  } catch (error) {
    console.error('Slide deletion error:', error);
    res.status(500).json({ error: 'Failed to delete slide' });
  }
});

// Reorder slides
router.post('/admin/:id/slides/reorder', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { slideIds } = req.body;

    if (!slideIds || !Array.isArray(slideIds)) {
      return res.status(400).json({ error: 'Slide IDs array is required' });
    }

    const reordered = await carouselStore.reorderSlides(id, slideIds);
    if (!reordered) {
      return res.status(404).json({ error: 'Carousel not found' });
    }

    res.json({
      success: true,
      message: 'Slides reordered successfully'
    });

  } catch (error) {
    console.error('Slide reorder error:', error);
    res.status(500).json({ error: 'Failed to reorder slides' });
  }
});

// Get carousel by name (for hero, promo, etc.)
router.get('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const carousel = await carouselStore.getByName(name);
    
    if (!carousel) {
      return res.status(404).json({ error: 'Carousel not found' });
    }

    res.json({
      success: true,
      carousel
    });
  } catch (error) {
    console.error('Carousel fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch carousel' });
  }
});

module.exports = router;
