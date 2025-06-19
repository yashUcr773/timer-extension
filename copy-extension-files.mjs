// Copy manifest.json, background.js, options.html to dist after build
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToCopy = [
  'manifest.json',
  'background.js',
  'options.html',
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

// Clean dist: remove any files/folders not in the allow list
const distPath = path.resolve(__dirname, 'dist');
const allowed = new Set(['manifest.json', 'background.js', 'options.html', 'vite.svg', 'assets', 'popup.html']);
fs.readdirSync(distPath).forEach((file) => {
  if (!allowed.has(file)) {
    fs.rmSync(path.join(distPath, file), { recursive: true, force: true });
    console.log(`Removed extra file/folder: ${file}`);
  }
});
