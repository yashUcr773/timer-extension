// Copy manifest.json, popup.html, and background.js to dist after build
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToCopy = [
  'manifest.json',
  'popup.html',
  'background.js',
];

filesToCopy.forEach((file) => {
  const src = path.resolve(__dirname, file);
  const dest = path.resolve(__dirname, 'dist', path.basename(file));
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to dist/`);
  } else {
    console.warn(`File not found: ${file}`);
  }
});

// Copy vite.svg to dist and dist/public, creating dist/public if needed
const iconSrc = path.resolve(__dirname, 'public/vite.svg');
const iconDestRoot = path.resolve(__dirname, 'dist/vite.svg');
const iconDestPublic = path.resolve(__dirname, 'dist/public/vite.svg');

if (fs.existsSync(iconSrc)) {
  fs.copyFileSync(iconSrc, iconDestRoot);
  console.log('Copied vite.svg to dist/');
  if (!fs.existsSync(path.dirname(iconDestPublic))) {
    fs.mkdirSync(path.dirname(iconDestPublic), { recursive: true });
  }
  fs.copyFileSync(iconSrc, iconDestPublic);
  console.log('Copied vite.svg to dist/public/');
} else {
  console.warn('vite.svg not found in public/');
}
