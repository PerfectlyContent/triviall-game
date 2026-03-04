/**
 * Generate Android adaptive icons and splash screens from SVG source.
 *
 * Usage: node scripts/generate-android-icons.js
 */
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const svgPath = join(rootDir, 'public', 'icons', 'icon.svg');
const resDir = join(rootDir, 'android', 'app', 'src', 'main', 'res');

// Android mipmap sizes for launcher icons
const mipmapSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

// Foreground icon sizes (adaptive icons use 108dp with safe zone)
const foregroundSizes = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

// Splash screen sizes
const splashSizes = {
  'drawable': { w: 480, h: 800 },
  'drawable-port-mdpi': { w: 320, h: 480 },
  'drawable-port-hdpi': { w: 480, h: 800 },
  'drawable-port-xhdpi': { w: 720, h: 1280 },
  'drawable-port-xxhdpi': { w: 960, h: 1600 },
  'drawable-port-xxxhdpi': { w: 1280, h: 1920 },
  'drawable-land-mdpi': { w: 480, h: 320 },
  'drawable-land-hdpi': { w: 800, h: 480 },
  'drawable-land-xhdpi': { w: 1280, h: 720 },
  'drawable-land-xxhdpi': { w: 1600, h: 960 },
  'drawable-land-xxxhdpi': { w: 1920, h: 1280 },
};

async function generate() {
  const svgBuffer = readFileSync(svgPath);

  // Generate launcher icons
  for (const [folder, size] of Object.entries(mipmapSizes)) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(resDir, folder, 'ic_launcher.png'));

    // Round icons (same as regular for our rounded-rect SVG)
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(resDir, folder, 'ic_launcher_round.png'));

    console.log(`Generated ${folder}/ic_launcher.png (${size}x${size})`);
  }

  // Generate foreground icons (for adaptive icons)
  for (const [folder, size] of Object.entries(foregroundSizes)) {
    const innerSize = Math.round(size * 0.65);
    const padding = Math.round((size - innerSize) / 2);

    await sharp(svgBuffer)
      .resize(innerSize, innerSize)
      .extend({
        top: padding,
        bottom: size - innerSize - padding,
        left: padding,
        right: size - innerSize - padding,
        background: { r: 26, g: 26, b: 46, alpha: 1 },
      })
      .png()
      .toFile(join(resDir, folder, 'ic_launcher_foreground.png'));

    console.log(`Generated ${folder}/ic_launcher_foreground.png (${size}x${size})`);
  }

  // Generate splash screens
  for (const [folder, { w, h }] of Object.entries(splashSizes)) {
    const iconSize = Math.min(w, h) * 0.4;

    await sharp(svgBuffer)
      .resize(Math.round(iconSize), Math.round(iconSize))
      .extend({
        top: Math.round((h - iconSize) / 2),
        bottom: Math.round((h - iconSize) / 2),
        left: Math.round((w - iconSize) / 2),
        right: Math.round((w - iconSize) / 2),
        background: { r: 26, g: 26, b: 46, alpha: 1 },
      })
      .resize(w, h)
      .png()
      .toFile(join(resDir, folder, 'splash.png'));

    console.log(`Generated ${folder}/splash.png (${w}x${h})`);
  }

  console.log('\nAll Android icons and splash screens generated!');
}

generate().catch(console.error);
