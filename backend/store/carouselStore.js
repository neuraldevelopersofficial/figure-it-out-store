const { v4: uuidv4 } = require('uuid');

// In-memory carousel store. Replace with DB in production.
let carousels = [
  {
    id: "1",
    name: "hero",
    title: "Hero Carousel",
    slides: [
      {
        id: "1",
        image: "/hero-figures.jpg",
        title: "Discover Amazing Anime Collectibles",
        subtitle: "From iconic figures to unique keychains, find your perfect piece",
        overlay: true,
        order: 1
      }
    ],
    autoPlay: true,
    interval: 6000,
    height: "h-[600px]",
    isActive: true,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z"
  },
  {
    id: "2",
    name: "promo",
    title: "Promotional Carousel",
    slides: [
      {
        id: "1",
        image: "/anime-banner3.jpg",
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
        image: "/hero-figures.jpg",
        title: "Premium Anime Figures",
        subtitle: "High-quality collectibles from your favorite series",
        overlay: true,
        order: 1
      }
    ],
    autoPlay: true,
    interval: 5000,
    height: "h-[400px]",
    isActive: true,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z"
  },
  {
    id: "4",
    name: "keychains",
    title: "Keychains Category Carousel",
    slides: [
      {
        id: "1",
        image: "/keychain-slide1.jpg",
        title: "Anime Keychains",
        subtitle: "Express your fandom with our exclusive collection",
        overlay: true,
        order: 1
      }
    ],
    autoPlay: true,
    interval: 5000,
    height: "h-[400px]",
    isActive: true,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z"
  }
];

function nowIso() {
  return new Date().toISOString();
}

function getAll() {
  return carousels;
}

function getById(id) {
  return carousels.find(c => c.id === id);
}

function getByName(name) {
  return carousels.find(c => c.name === name);
}

function getActive() {
  return carousels.filter(c => c.isActive);
}

function add(carouselData) {
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

  carousels.push(newCarousel);
  return newCarousel;
}

function update(id, updates) {
  const index = carousels.findIndex(c => c.id === id);
  if (index === -1) return null;

  carousels[index] = {
    ...carousels[index],
    ...updates,
    updated_at: nowIso()
  };

  return carousels[index];
}

function remove(id) {
  const index = carousels.findIndex(c => c.id === id);
  if (index === -1) return false;

  carousels.splice(index, 1);
  return true;
}

function addSlide(carouselId, slideData) {
  const carousel = getById(carouselId);
  if (!carousel) return null;

  const slideId = slideData.id || uuidv4();
  const newSlide = {
    id: slideId,
    image: slideData.image,
    title: slideData.title,
    subtitle: slideData.subtitle,
    ctaText: slideData.ctaText,
    ctaLink: slideData.ctaLink,
    overlay: slideData.overlay !== undefined ? slideData.overlay : true,
    order: slideData.order || (carousel.slides.length + 1)
  };

  carousel.slides.push(newSlide);
  carousel.updated_at = nowIso();
  
  return newSlide;
}

function updateSlide(carouselId, slideId, updates) {
  const carousel = getById(carouselId);
  if (!carousel) return null;

  const slideIndex = carousel.slides.findIndex(s => s.id === slideId);
  if (slideIndex === -1) return null;

  carousel.slides[slideIndex] = {
    ...carousel.slides[slideIndex],
    ...updates
  };

  carousel.updated_at = nowIso();
  return carousel.slides[slideIndex];
}

function removeSlide(carouselId, slideId) {
  const carousel = getById(carouselId);
  if (!carousel) return false;

  const slideIndex = carousel.slides.findIndex(s => s.id === slideId);
  if (slideIndex === -1) return false;

  carousel.slides.splice(slideIndex, 1);
  carousel.updated_at = nowIso();
  
  // Reorder remaining slides
  carousel.slides.forEach((slide, index) => {
    slide.order = index + 1;
  });

  return true;
}

function reorderSlides(carouselId, slideIds) {
  const carousel = getById(carouselId);
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

  return true;
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
  reorderSlides
};
