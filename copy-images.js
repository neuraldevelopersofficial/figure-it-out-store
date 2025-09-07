import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create public directory if it doesn't exist
const publicDir = 'public';
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Copy images from src/assets to public
const assetsDir = 'src/assets';
const imageFiles = [
  'hero-figures.jpg',
  'anime-banner2.jpeg',
  'anime-banner3.jpg',
  'deku-figure.jpg',
  'goku-keychain.jpg',
  'keychain-slide1.jpg',
  'keychain-slide2.jpg',
  'keychain-slide3.jpg',
  'levi-figure.jpg',
  'luffy-figure.jpg',
  'naruto-figure.jpg',
  'pikachu-keychain.jpg',
  'tanjiro-keychain.jpg',
  'totoro-keychain.jpg'
];

console.log('📁 Copying images to public folder...');

imageFiles.forEach(file => {
  const sourcePath = path.join(assetsDir, file);
  const destPath = path.join(publicDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✅ Copied: ${file}`);
  } else {
    console.log(`❌ Not found: ${file}`);
  }
});

console.log('🎉 Image copy completed!');
console.log('📝 Note: Make sure your backend server is serving the public folder');
