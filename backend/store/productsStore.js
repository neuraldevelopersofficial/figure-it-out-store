const { v4: uuidv4 } = require('uuid');

// Simple in-memory product store. Replace with DB in production.
// Using snake_case for backend internal representation.
let products = [
  {
    id: "1",
    name: "Naruto Uzumaki Figure",
    price: 2500,
    original_price: 3000,
    image: "https://drive.google.com/uc?export=view&id=1eCZ1MqayGsGzI1WwrLlJVYEmMl_Kn6pb",
    images: [
      "https://drive.google.com/uc?export=view&id=1eCZ1MqayGsGzI1WwrLlJVYEmMl_Kn6pb",
      "https://drive.google.com/uc?export=view&id=1eCZ1MqayGsGzI1WwrLlJVYEmMl_Kn6pb",
      "https://drive.google.com/uc?export=view&id=1eCZ1MqayGsGzI1WwrLlJVYEmMl_Kn6pb"
    ],
    category: "Anime Figures",
    category_slug: "anime-figures",
    rating: 4.8,
    reviews: 156,
    is_new: true,
    is_on_sale: true,
    discount: 17,
    description: "High-quality Naruto Uzumaki action figure with detailed sculpting and multiple accessories.",
    in_stock: true,
    stock_quantity: 25,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z"
  },
  {
    id: "2",
    name: "Dragon Ball Z Goku Figure",
    price: 3200,
    original_price: 3800,
    image: "/images/goku-figure.jpg",
    images: [
      "/images/goku-figure.jpg",
      "/images/goku-figure.jpg",
      "/images/goku-figure.jpg"
    ],
    category: "Anime Figures",
    category_slug: "anime-figures",
    rating: 4.9,
    reviews: 203,
    is_new: false,
    is_on_sale: true,
    discount: 16,
    description: "Premium Goku figure in Super Saiyan form with energy effects and interchangeable faces.",
    in_stock: true,
    stock_quantity: 18,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z"
  }
];

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeCategoryToSlug(input) {
  const raw = slugify(input);
  const alias = {
    'anime-figure': 'anime-figures',
    'anime-figures': 'anime-figures',
    'keychain': 'keychains',
    'keychains': 'keychains'
  };
  return alias[raw] || raw;
}

function nowIso() {
  return new Date().toISOString();
}

function getAll() {
  return products;
}

function getById(id) {
  return products.find(p => p.id === id);
}

function search(q) {
  const s = q.toLowerCase();
  return products.filter(p =>
    (p.name || '').toLowerCase().includes(s) ||
    (p.description || '').toLowerCase().includes(s) ||
    (p.category || '').toLowerCase().includes(s)
  );
}

function getByCategory(category) {
  const slug = normalizeCategoryToSlug(category);
  return products.filter(p => normalizeCategoryToSlug(p.category_slug || p.category) === slug);
}

function add(productSnake) {
  const id = productSnake.id && String(productSnake.id).trim().length > 0 ? String(productSnake.id) : uuidv4();
  const created_at = nowIso();
  const category = productSnake.category || '';
  const category_slug = normalizeCategoryToSlug(category);
  const base = {
    id,
    name: productSnake.name,
    category,
    category_slug,
    price: Number(productSnake.price) || 0,
    original_price: productSnake.original_price !== undefined ? Number(productSnake.original_price) : undefined,
    discount: productSnake.discount !== undefined ? Number(productSnake.discount) : undefined,
    is_on_sale: typeof productSnake.is_on_sale === 'boolean' ? productSnake.is_on_sale : undefined,
    is_new: typeof productSnake.is_new === 'boolean' ? productSnake.is_new : undefined,
    image: productSnake.image || '',
    images: productSnake.images || [productSnake.image || ''],
    description: productSnake.description || '',
    in_stock: typeof productSnake.in_stock === 'boolean' ? productSnake.in_stock : undefined,
    rating: productSnake.rating !== undefined ? Number(productSnake.rating) : undefined,
    reviews: productSnake.reviews !== undefined ? Number(productSnake.reviews) : undefined,
    stock_quantity: productSnake.stock_quantity !== undefined ? Number(productSnake.stock_quantity) : 0,
    created_at,
    updated_at: created_at
  };
  if (typeof base.in_stock !== 'boolean') {
    base.in_stock = (base.stock_quantity || 0) > 0;
  }
  products.push(base);
  return base;
}

function update(id, updatesSnake) {
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  const current = products[idx];
  const nextCategory = updatesSnake.category !== undefined ? updatesSnake.category : current.category;
  const nextCategorySlug = normalizeCategoryToSlug(updatesSnake.category !== undefined ? updatesSnake.category : current.category_slug || current.category);
  const updated = {
    ...current,
    ...updatesSnake,
    category: nextCategory,
    category_slug: nextCategorySlug,
    price: updatesSnake.price !== undefined ? Number(updatesSnake.price) : current.price,
    original_price: updatesSnake.original_price !== undefined ? Number(updatesSnake.original_price) : current.original_price,
    discount: updatesSnake.discount !== undefined ? Number(updatesSnake.discount) : current.discount,
    rating: updatesSnake.rating !== undefined ? Number(updatesSnake.rating) : current.rating,
    reviews: updatesSnake.reviews !== undefined ? Number(updatesSnake.reviews) : current.reviews,
    stock_quantity: updatesSnake.stock_quantity !== undefined ? Number(updatesSnake.stock_quantity) : current.stock_quantity,
    images: updatesSnake.images || current.images || [current.image || ''],
    updated_at: nowIso()
  };
  if (typeof updatesSnake.in_stock === 'boolean') {
    updated.in_stock = updatesSnake.in_stock;
  } else if (updatesSnake.stock_quantity !== undefined) {
    updated.in_stock = updated.stock_quantity > 0;
  }
  products[idx] = updated;
  return updated;
}

function remove(id) {
  const before = products.length;
  products = products.filter(p => p.id !== id);
  return products.length < before;
}

function upsertMany(batchSnake) {
  let created = 0;
  let updated = 0;
  for (const p of batchSnake) {
    const id = p.id && String(p.id).trim().length > 0 ? String(p.id).trim() : null;
    if (id) {
      const existing = getById(id);
      if (existing) {
        update(id, p);
        updated++;
        continue;
      }
    }
    add(p);
    created++;
  }
  return { created, updated };
}

function toAdminList() {
  return products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    stock: p.stock_quantity || 0,
    image: p.image || ''
  }));
}

function clearAll() {
  const previousCount = products.length;
  products = [];
  return previousCount;
}

module.exports = {
  getAll,
  getById,
  search,
  getByCategory,
  add,
  update,
  remove,
  upsertMany,
  toAdminList,
  clearAll
};


