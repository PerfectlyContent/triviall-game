/**
 * Generate PNG app icons from SVG source.
 *
 * Usage: node scripts/generate-icons.js
 *
 * Requires: sharp (npm install --save-dev sharp)
 *
 * Generates all sizes needed for:
 * - PWA manifest
 * - Android adaptive icons (via Capacitor)
 * - Play Store (512x512)
 */
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const iconsDir = join(rootDir, 'public', 'icons');
const svgPath = join(iconsDir, 'icon.svg');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const maskableSizes = [192, 512];

async function generate() {
  const svgBuffer = readFileSync(svgPath);

  // Generate standard icons
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(iconsDir, `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Generate maskable icons (with extra padding for safe zone)
  for (const size of maskableSizes) {
    // Maskable icons need content within the inner 80% safe zone
    const innerSize = Math.round(size * 0.8);
    const padding = Math.round((size - innerSize) / 2);

    await sharp(svgBuffer)
      .resize(innerSize, innerSize)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 26, g: 26, b: 46, alpha: 1 } // #1A1A2E
      })
      .png()
      .toFile(join(iconsDir, `icon-maskable-${size}x${size}.png`));
    console.log(`Generated icon-maskable-${size}x${size}.png`);
  }

  // Generate favicon
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(join(rootDir, 'public', 'favicon.png'));
  console.log('Generated favicon.png');

  console.log('\nAll icons generated successfully!');
}

generate().catch(console.error);
