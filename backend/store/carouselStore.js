const { v4: uuidv4 } = require('uuid');
const { getDatabase, getCollection, COLLECTIONS } = require('../config/database');

// Helper: try to get MongoDB collection; return null if DB not configured
async function getCarouselsCollection() {
  try {
    const db = await getDatabase();
    if (!db) return null;
    return await getCollection(COLLECTIONS.CAROUSELS);
  } catch (e) {
    return null;
  }
}

// In-memory carousel store. Uses DB when available, falls back to memory.
let carousels = [
  {
    id: "1",
    name: "hero",
    title: "Hero Carousel",
    slides: [
      {
        id: "1",
        image: "/banners/homepage1.jpg?v=2025-01-07-5",
        title: "",
        subtitle: "",
        overlay: false,
        order: 1
      },
      {
        id: "2",
        image: "/banners/homepage2.jpg?v=2025-01-07-5",
        title: "",
        subtitle: "",
        overlay: false,
        order: 2
      },
      {
        id: "3",
        image: "/banners/homepage3.jpg?v=2025-01-07-5",
        title: "",
        subtitle: "",
        overlay: false,
        order: 3
      },
      {
        id: "4",
        image: "/banners/homepage4.jpg?v=2025-01-07-5",
        title: "",
        subtitle: "",
        overlay: false,
        order: 4
      },
      {
        id: "5",
        image: "/banners/homepage5.jpg?v=2025-01-07-5",
        title: "",
        subtitle: "",
        overlay: false,
        order: 5
      },
      {
        id: "6",
        image: "/banners/homepage6.jpg?v=2025-01-07-5",
        title: "",
        subtitle: "",
        overlay: false,
        order: 6
      },
      {
        id: "7",
        image: "/banners/homepage7.jpg?v=2025-01-07-5",
        title: "",
        subtitle: "",
        overlay: false,
        order: 7
      },
      {
        id: "8",
        image: "/banners/homepage8.jpg?v=2025-01-07-5",
        title: "",
        subtitle: "",
        overlay: false,
        order: 8
      },
      {
        id: "9",
        image: "/banners/homepage9.jpg?v=2025-01-07-5",
        title: "",
        subtitle: "",
        overlay: false,
        order: 9
      },
      {
        id: "10",
        image: "/banners/homepage10.jpg?v=2025-01-07-5",
        title: "",
        subtitle: "",
        overlay: false,
        order: 10
      },
      {
        id: "11",
        image: "/banners/homepage11.jpg?v=2025-01-07-5",
        title: "",
        subtitle: "",
        overlay: false,
        order: 11
      }
    ],
    autoPlay: true,
    interval: 4000,
    height: "h-[80vh]",
    isActive: true,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2025-01-07T00:00:00.000Z"
  },
  {
    id: "2",
    name: "promo",
    title: "Promotional Carousel",
    slides: [
      {
        id: "1",
        image: "/anime-banner3.jpeg",
        title: "Summer Sale",
        subtitle: "Up to 50% off on selected anime figures",
        overlay: true,
        order: 1
      }
    ],
    autoPlay: true,
    interval: 4000,
    height: "h-[400px]",
    isActive: true,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z"
  },
  {
    id: "3",
    name: "anime-figures",
    title: "Anime Figures Category Carousel",
    slides: [
      {
        id: "1",
        image: "/banners/figurine1.jpg?v=2025-01-07-5",
        title: "",
        subtitle: "",
        overlay: false,
        order: 1
      },
      {
        id: "2",
        image: "/banners/figurine2.jpg?v=2025-01-07-5",
        title: "",
        subtitle: "",
        overlay: false,
        order: 2
      },
      {
        id: "3",
        image: "/banners/figurine3.jpg?v=2025-01-07-5",
        title: "",
        subtitle: "",
        overlay: false,
        order: 3
      }
    ],
    autoPlay: true,
    interval: 4000,
    height: "h-[70vh]",
    isActive: true,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2025-01-07T00:00:00.000Z"
  },
  {
    id: "4",
    name: "keychains",
    title: "Keychains Category Carousel",
    slides: [
      {
        id: "1",
        image: "/banners/keychain1.jpg?v=2025-01-07-5",
        title: "",
        subtitle: "",
        overlay: false,
        order: 1
      },
      {
        id: "2",
        image: "/banners/keychain2.jpg?v=2025-01-07-5",
        title: "",
        subtitle: "",
        overlay: false,
        order: 2
      }
    ],
    autoPlay: true,
    interval: 4000,
    height: "h-[70vh]",
    isActive: true,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2025-01-07T00:00:00.000Z"
  }
];

function nowIso() {
  return new Date().toISOString();
}

async function getAll() {
  try {
    const collection = await getCarouselsCollection();
    if (collection) {
      const docs = await collection.find({}).toArray();
      console.log('📦 [Store] getAll carousels from DB:', docs.length);
      return docs;
    }
  } catch (e) {
    console.error('Error fetching carousels from database:', e);
  }
  
  // Fallback to in-memory store
  console.log('📦 [Store] getAll carousels from memory:', carousels.length);
  return carousels;
}

async function getById(id) {
  try {
    const collection = await getCarouselsCollection();
    if (collection) {
      const doc = await collection.findOne({ id: id });
      console.log('📦 [Store] getById from DB:', { id, found: !!doc });
      return doc;
    }
  } catch (e) {
    console.error('Error fetching carousel from database:', e);
  }
  
  // Fallback to in-memory store
  const mem = carousels.find(c => c.id === id);
  console.log('📦 [Store] getById from memory:', { id, found: !!mem });
  return mem;
}

async function getByName(name) {
  try {
    const collection = await getCarouselsCollection();
    if (collection) {
      const doc = await collection.findOne({ name: name });
      console.log('📦 [Store] getByName from DB:', { name, found: !!doc });
      return doc;
    }
  } catch (e) {
    console.error('Error fetching carousel by name from database:', e);
  }
  
  // Fallback to in-memory store
  const mem = carousels.find(c => c.name === name);
  console.log('📦 [Store] getByName from memory:', { name, found: !!mem });
  return mem;
}

async function getActive() {
  try {
    const collection = await getCarouselsCollection();
    if (collection) {
      const docs = await collection.find({ isActive: true }).toArray();
      console.log('📦 [Store] getActive from DB:', docs.length);
      return docs;
    }
  } catch (e) {
    console.error('Error fetching active carousels from database:', e);
  }
  
  // Fallback to in-memory store
  const mem = carousels.filter(c => c.isActive);
  console.log('📦 [Store] getActive from memory:', mem.length);
  return mem;
}

async function add(carouselData) {
  const id = carouselData.id || uuidv4();
  const created_at = nowIso();
  
  const newCarousel = {
    id,
    name: carouselData.name,
    title: carouselData.title,
    slides: carouselData.slides || [],
    autoPlay: carouselData.autoPlay !== undefined ? carouselData.autoPlay : true,
    interval: carouselData.interval || 5000,
    height: carouselData.height || "h-[400px]",
    isActive: carouselData.isActive !== undefined ? carouselData.isActive : true,
    created_at,
    updated_at: created_at
  };

  try {
    const collection = await getCarouselsCollection();
    if (collection) {
      await collection.insertOne(newCarousel);
      console.log('✅ Carousel saved to database:', newCarousel.name);
      return newCarousel;
    }
  } catch (e) {
    console.error('Error saving carousel to database:', e);
  }

  // Fallback to in-memory store
  carousels.push(newCarousel);
  console.log('✅ Carousel saved to memory:', newCarousel.name);
  return newCarousel;
}

async function update(id, updates) {
  try {
    const collection = await getCarouselsCollection();
    if (collection) {
      const updateData = {
        ...updates,
        updated_at: nowIso()
      };
      
      const result = await collection.findOneAndUpdate(
        { id: id },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      if (result) {
        console.log('✅ Carousel updated in database:', id);
        return result;
      }
    }
  } catch (e) {
    console.error('Error updating carousel in database:', e);
  }

  // Fallback to in-memory store
  const index = carousels.findIndex(c => c.id === id);
  if (index === -1) return null;

  carousels[index] = {
    ...carousels[index],
    ...updates,
    updated_at: nowIso()
  };

  console.log('✅ Carousel updated in memory:', id);
  return carousels[index];
}

async function remove(id) {
  try {
    const collection = await getCarouselsCollection();
    if (collection) {
      const result = await collection.deleteOne({ id: id });
      if (result.deletedCount > 0) {
        console.log('✅ Carousel deleted from database:', id);
        return true;
      }
    }
  } catch (e) {
    console.error('Error deleting carousel from database:', e);
  }

  // Fallback to in-memory store
  const index = carousels.findIndex(c => c.id === id);
  if (index === -1) return false;

  carousels.splice(index, 1);
  console.log('✅ Carousel deleted from memory:', id);
  return true;
}

async function addSlide(carouselId, slideData) {
  const carousel = await getById(carouselId);
  if (!carousel) return null;

  const slideId = slideData.id || uuidv4();
  
  // Ensure image path starts with /uploads/ if it's not already a full URL
  let imagePath = slideData.image;
  if (imagePath && !imagePath.startsWith('/uploads/') && !imagePath.startsWith('http')) {
    imagePath = `/uploads/${imagePath}`;
  }
  
  const newSlide = {
    id: slideId,
    image: imagePath,
    title: slideData.title,
    subtitle: slideData.subtitle,
    ctaText: slideData.ctaText,
    ctaLink: slideData.ctaLink,
    overlay: slideData.overlay !== undefined ? slideData.overlay : true,
    order: slideData.order || (carousel.slides.length + 1)
  };

  // Add slide to carousel
  carousel.slides.push(newSlide);
  carousel.updated_at = nowIso();
  console.log('🖼️  [Store] addSlide:', { carouselId, slideId, image: newSlide.image, totalSlides: carousel.slides.length });
  
  // Update carousel in database AND in-memory store
  try {
    const collection = await getCarouselsCollection();
    if (collection) {
      const result = await collection.updateOne(
        { id: carouselId },
        { 
          $set: { 
            slides: carousel.slides,
            updated_at: carousel.updated_at
          }
        }
      );
      console.log('✅ Slide added to carousel in database:', { carouselId, matched: result.matchedCount, modified: result.modifiedCount });
      
      if (result.matchedCount === 0) {
        console.warn('⚠️ No carousel found in DB with id:', carouselId, '- updating memory instead');
        const memIndex = carousels.findIndex(c => c.id === carouselId);
        if (memIndex !== -1) {
          carousels[memIndex] = carousel;
          console.log('✅ Slide added to carousel in memory (no DB match):', carouselId);
        }
      }
    } else {
      // If no DB, update in-memory store
      const memIndex = carousels.findIndex(c => c.id === carouselId);
      if (memIndex !== -1) {
        carousels[memIndex] = carousel;
        console.log('✅ Slide added to carousel in memory:', carouselId);
      }
    }
  } catch (e) {
    console.error('Error updating carousel in database:', e);
    // Fallback to memory update
    const memIndex = carousels.findIndex(c => c.id === carouselId);
    if (memIndex !== -1) {
      carousels[memIndex] = carousel;
      console.log('✅ Slide added to carousel in memory (fallback):', carouselId);
    }
  }
  
  return newSlide;
}

async function updateSlide(carouselId, slideId, updates) {
  const carousel = await getById(carouselId);
  if (!carousel) return null;

  const slideIndex = carousel.slides.findIndex(s => s.id === slideId);
  if (slideIndex === -1) return null;
  
  // Handle image path formatting if image is being updated
  if (updates.image && !updates.image.startsWith('/uploads/') && !updates.image.startsWith('http')) {
    updates.image = `/uploads/${updates.image}`;
  }

  carousel.slides[slideIndex] = {
    ...carousel.slides[slideIndex],
    ...updates
  };

  carousel.updated_at = nowIso();
  console.log('🖼️  [Store] updateSlide:', { carouselId, slideId, image: carousel.slides[slideIndex].image });
  
  // Update carousel in database AND in-memory store
  try {
    const collection = await getCarouselsCollection();
    if (collection) {
      const result = await collection.updateOne(
        { id: carouselId },
        { 
          $set: { 
            slides: carousel.slides,
            updated_at: carousel.updated_at
          }
        }
      );
      console.log('✅ Slide updated in carousel database:', { carouselId, matched: result.matchedCount, modified: result.modifiedCount });
      
      if (result.matchedCount === 0) {
        console.warn('⚠️ No carousel found in DB with id:', carouselId, '- updating memory instead');
        const memIndex = carousels.findIndex(c => c.id === carouselId);
        if (memIndex !== -1) {
          carousels[memIndex] = carousel;
          console.log('✅ Slide updated in carousel in memory (no DB match):', carouselId);
        }
      }
    } else {
      // If no DB, update in-memory store
      const memIndex = carousels.findIndex(c => c.id === carouselId);
      if (memIndex !== -1) {
        carousels[memIndex] = carousel;
        console.log('✅ Slide updated in carousel in memory:', carouselId);
      }
    }
  } catch (e) {
    console.error('Error updating carousel in database:', e);
    // Fallback to memory update
    const memIndex = carousels.findIndex(c => c.id === carouselId);
    if (memIndex !== -1) {
      carousels[memIndex] = carousel;
      console.log('✅ Slide updated in carousel in memory (fallback):', carouselId);
    }
  }
  
  return carousel.slides[slideIndex];
}

async function removeSlide(carouselId, slideId) {
  const carousel = await getById(carouselId);
  if (!carousel) return false;

  const slideIndex = carousel.slides.findIndex(s => s.id === slideId);
  if (slideIndex === -1) return false;

  carousel.slides.splice(slideIndex, 1);
  carousel.updated_at = nowIso();
  console.log('🖼️  [Store] removeSlide:', { carouselId, slideId, totalSlides: carousel.slides.length });
  
  // Reorder remaining slides
  carousel.slides.forEach((slide, index) => {
    slide.order = index + 1;
  });

  // Update carousel in database AND in-memory store
  try {
    const collection = await getCarouselsCollection();
    if (collection) {
      const result = await collection.updateOne(
        { id: carouselId },
        { 
          $set: { 
            slides: carousel.slides,
            updated_at: carousel.updated_at
          }
        }
      );
      console.log('✅ Slide removed from carousel database:', { carouselId, matched: result.matchedCount, modified: result.modifiedCount });
      
      if (result.matchedCount === 0) {
        console.warn('⚠️ No carousel found in DB with id:', carouselId, '- updating memory instead');
        const memIndex = carousels.findIndex(c => c.id === carouselId);
        if (memIndex !== -1) {
          carousels[memIndex] = carousel;
          console.log('✅ Slide removed from carousel in memory (no DB match):', carouselId);
        }
      }
    } else {
      // If no DB, update in-memory store
      const memIndex = carousels.findIndex(c => c.id === carouselId);
      if (memIndex !== -1) {
        carousels[memIndex] = carousel;
        console.log('✅ Slide removed from carousel in memory:', carouselId);
      }
    }
  } catch (e) {
    console.error('Error updating carousel in database:', e);
    // Fallback to memory update
    const memIndex = carousels.findIndex(c => c.id === carouselId);
    if (memIndex !== -1) {
      carousels[memIndex] = carousel;
      console.log('✅ Slide removed from carousel in memory (fallback):', carouselId);
    }
  }

  return true;
}

async function reorderSlides(carouselId, slideIds) {
  const carousel = await getById(carouselId);
  if (!carousel) return false;

  // Create a map of new order
  const orderMap = {};
  slideIds.forEach((slideId, index) => {
    orderMap[slideId] = index + 1;
  });

  // Update slide orders
  carousel.slides.forEach(slide => {
    if (orderMap[slide.id] !== undefined) {
      slide.order = orderMap[slide.id];
    }
  });

  // Sort slides by new order
  carousel.slides.sort((a, b) => a.order - b.order);
  carousel.updated_at = nowIso();
  console.log('🖼️  [Store] reorderSlides:', { carouselId, slideIdsCount: slideIds.length });

  // Update carousel in database AND in-memory store
  try {
    const collection = await getCarouselsCollection();
    if (collection) {
      const result = await collection.updateOne(
        { id: carouselId },
        { 
          $set: { 
            slides: carousel.slides,
            updated_at: carousel.updated_at
          }
        }
      );
      console.log('✅ Slides reordered in carousel database:', { carouselId, matched: result.matchedCount, modified: result.modifiedCount });
      
      if (result.matchedCount === 0) {
        console.warn('⚠️ No carousel found in DB with id:', carouselId, '- updating memory instead');
        const memIndex = carousels.findIndex(c => c.id === carouselId);
        if (memIndex !== -1) {
          carousels[memIndex] = carousel;
          console.log('✅ Slides reordered in carousel in memory (no DB match):', carouselId);
        }
      }
    } else {
      // If no DB, update in-memory store
      const memIndex = carousels.findIndex(c => c.id === carouselId);
      if (memIndex !== -1) {
        carousels[memIndex] = carousel;
        console.log('✅ Slides reordered in carousel in memory:', carouselId);
      }
    }
  } catch (e) {
    console.error('Error updating carousel in database:', e);
    // Fallback to memory update
    const memIndex = carousels.findIndex(c => c.id === carouselId);
    if (memIndex !== -1) {
      carousels[memIndex] = carousel;
      console.log('✅ Slides reordered in carousel in memory (fallback):', carouselId);
    }
  }

  return true;
}

// Initialize function to migrate existing carousels to database
async function init() {
  try {
    const collection = await getCarouselsCollection();
    if (collection) {
      // Check if database already has carousels
      const existingCount = await collection.countDocuments();
      if (existingCount === 0) {
        // Migrate in-memory carousels to database
        console.log('🔄 Migrating carousels to database...');
        await collection.insertMany(carousels);
        console.log(`✅ Migrated ${carousels.length} carousels to database`);
      } else {
        console.log(`✅ Database already has ${existingCount} carousels`);
      }
    }
  } catch (error) {
    console.error('❌ Error initializing carousel store:', error);
  }
}

module.exports = {
  getAll,
  getById,
  getByName,
  getActive,
  add,
  update,
  remove,
  addSlide,
  updateSlide,
  removeSlide,
  reorderSlides,
  init,
  carousels // Export for backward compatibility
};
