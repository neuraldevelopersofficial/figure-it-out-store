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

  carousel.slides.push(newSlide);
  carousel.updated_at = nowIso();
  
  return newSlide;
}

function updateSlide(carouselId, slideId, updates) {
  const carousel = getById(carouselId);
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
