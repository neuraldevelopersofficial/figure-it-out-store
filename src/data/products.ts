import { Product } from '@/context/StoreContext';

// Import images (you'll need to add these images to your assets folder)
// For now, I'll use placeholder image names that match your existing assets

export const products: Product[] = [
  {
    id: "1",
    name: "Naruto Uzumaki Figure - Sage Mode",
    price: 2999,
    originalPrice: 3499,
    image: "/naruto-figure.jpg",
    category: "Anime Figures",
    rating: 4.8,
    reviews: 124,
    isNew: true,
    isOnSale: true,
    discount: 15,
    description: "Premium quality Naruto Uzumaki figure in Sage Mode. This highly detailed collectible features Naruto in his iconic orange jumpsuit with toad sage markings. Perfect for any Naruto fan's collection.",
    inStock: true
  },
  {
    id: "2", 
    name: "Dragon Ball Z Goku Keychain",
    price: 599,
    originalPrice: 799,
    image: "/goku-keychain.jpg",
    category: "Keychains",
    rating: 4.6,
    reviews: 89,
    isOnSale: true,
    discount: 25,
    description: "Durable metal keychain featuring Goku from Dragon Ball Z. Perfect accessory for your keys or backpack. Features vibrant colors and detailed artwork.",
    inStock: true
  },
  {
    id: "3",
    name: "Attack on Titan Levi Figure",
    price: 3499,
    image: "/levi-figure.jpg",
    category: "Anime Figures",
    rating: 4.9,
    reviews: 156,
    isNew: true,
    description: "Exclusive Levi Ackerman figure from Attack on Titan. This detailed collectible captures Levi's signature pose with his 3D Maneuver Gear. Limited edition release.",
    inStock: true
  },
  {
    id: "4",
    name: "Pokemon Pikachu Keychain Set",
    price: 1299,
    originalPrice: 1499,
    image: "/pikachu-keychain.jpg",
    category: "Keychains", 
    rating: 4.7,
    reviews: 203,
    isOnSale: true,
    discount: 15,
    description: "Adorable Pikachu keychain set featuring multiple poses and expressions. Made from high-quality materials, perfect for Pokemon fans of all ages.",
    inStock: true
  },
  {
    id: "5",
    name: "One Piece Luffy Gear 5 Figure",
    price: 4299,
    image: "/luffy-figure.jpg",
    category: "Anime Figures",
    rating: 4.9,
    reviews: 78,
    isNew: true,
    description: "Epic Luffy Gear 5 figure from One Piece. This premium collectible showcases Luffy's most powerful form with incredible detail and dynamic posing.",
    inStock: true
  },
  {
    id: "6",
    name: "Demon Slayer Tanjiro Keychain",
    price: 699,
    originalPrice: 899,
    image: "/tanjiro-keychain.jpg",
    category: "Keychains",
    rating: 4.5,
    reviews: 167,
    isOnSale: true,
    discount: 20,
    description: "Beautiful Tanjiro Kamado keychain from Demon Slayer. Features his signature hanafuda earrings and water breathing sword design.",
    inStock: true
  },
  {
    id: "7",
    name: "My Hero Academia Deku Figure",
    price: 2799,
    image: "/deku-figure.jpg",
    category: "Anime Figures", 
    rating: 4.8,
    reviews: 134,
    description: "Izuku Midoriya (Deku) figure from My Hero Academia. Captures his determination and hero spirit in this beautifully sculpted collectible.",
    inStock: true
  },
  {
    id: "8",
    name: "Studio Ghibli Totoro Keychain",
    price: 10,
    image: "/totoro-keychain.jpg",
    category: "Keychains",
    rating: 4.9,
    reviews: 245,
    description: "Charming Totoro keychain from Studio Ghibli's My Neighbor Totoro. Made with love and attention to detail, perfect for Ghibli fans.",
    inStock: true
  },
  {
    id: "9",
    name: "Jujutsu Kaisen Gojo Figure",
    price: 3899,
    image: "/gojo-figure.jpg",
    category: "Anime Figures",
    rating: 4.9,
    reviews: 92,
    isNew: true,
    description: "Satoru Gojo figure from Jujutsu Kaisen. Features his iconic blindfold and infinity technique pose. Limited availability.",
    inStock: false
  },
  {
    id: "10",
    name: "Hunter x Hunter Gon Keychain",
    price: 649,
    image: "/gon-keychain.jpg",
    category: "Keychains",
    rating: 4.4,
    reviews: 78,
    description: "Gon Freecss keychain from Hunter x Hunter. Features his green outfit and fishing rod design.",
    inStock: true
  },
  {
    id: "11",
    name: "Bleach Ichigo Figure",
    price: 3199,
    originalPrice: 3599,
    image: "/ichigo-figure.jpg",
    category: "Anime Figures",
    rating: 4.7,
    reviews: 156,
    isOnSale: true,
    discount: 10,
    description: "Ichigo Kurosaki figure from Bleach. Captures his Bankai form with his signature black and red outfit.",
    inStock: true
  },
  {
    id: "12",
    name: "Death Note L Keychain",
    price: 549,
    image: "/l-keychain.jpg",
    category: "Keychains",
    rating: 4.6,
    reviews: 89,
    description: "L Lawliet keychain from Death Note. Features his iconic sitting pose and detective style.",
    inStock: true
  }
];

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.isNew || product.isOnSale).slice(0, 8);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery)
  );
};
