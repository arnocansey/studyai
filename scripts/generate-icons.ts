/**
 * Generate PNG assets from SVG brand files.
 * Run: npx ts-node scripts/generate-icons.ts
 * Requires: pnpm add -D sharp @types/sharp
 */

import sharp from 'sharp';
import { resolve } from 'path';

const ASSETS_DIR = resolve(__dirname, '../mobile/assets');
const PUBLIC_DIR = resolve(__dirname, '../frontend/public');

const SPLASH_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="1284" height="2778" viewBox="0 0 1284 2778" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#030303"/>
      <stop offset="50%" stop-color="#0A0A1A"/>
      <stop offset="100%" stop-color="#030303"/>
    </linearGradient>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7C3AED"/>
      <stop offset="50%" stop-color="#6D28D9"/>
      <stop offset="100%" stop-color="#4F46E5"/>
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A78BFA"/>
      <stop offset="100%" stop-color="#818CF8"/>
    </linearGradient>
    <radialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#7C3AED" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1284" height="2778" fill="url(#bgGrad)"/>
  <circle cx="642" cy="900" r="400" fill="url(#orbGlow)"/>
  <g transform="translate(522, 1100) scale(5.5)">
    <path d="M24 12 L44 24 L24 36 L4 24 Z" fill="url(#logoGrad)" opacity="0.9"/>
    <rect x="18" y="6" width="12" height="10" rx="2" fill="url(#logoGrad)"/>
    <line x1="24" y1="10" x2="38" y2="4" stroke="url(#glowGrad)" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="38" cy="4" r="3" fill="#A78BFA"/>
    <circle cx="12" cy="24" r="2.5" fill="white" opacity="0.9"/>
    <circle cx="24" cy="24" r="3" fill="white"/>
    <circle cx="36" cy="24" r="2.5" fill="white" opacity="0.9"/>
    <circle cx="18" cy="16" r="2" fill="white" opacity="0.7"/>
    <circle cx="30" cy="16" r="2" fill="white" opacity="0.7"/>
    <line x1="12" y1="24" x2="24" y2="24" stroke="white" stroke-width="1.2" opacity="0.5"/>
    <line x1="24" y1="24" x2="36" y2="24" stroke="white" stroke-width="1.2" opacity="0.5"/>
    <line x1="18" y1="16" x2="12" y2="24" stroke="white" stroke-width="1" opacity="0.4"/>
    <line x1="18" y1="16" x2="24" y2="24" stroke="white" stroke-width="1" opacity="0.4"/>
    <line x1="30" y1="16" x2="24" y2="24" stroke="white" stroke-width="1" opacity="0.4"/>
    <line x1="30" y1="16" x2="36" y2="24" stroke="white" stroke-width="1" opacity="0.4"/>
    <path d="M38 32 L40 28 L42 32 L46 34 L42 36 L40 40 L38 36 L34 34 Z" fill="url(#glowGrad)" opacity="0.85"/>
  </g>
  <text x="642" y="1480" font-family="system-ui, sans-serif" font-size="96" font-weight="700" letter-spacing="-2" text-anchor="middle">
    <tspan fill="#EDEDED">Study</tspan><tspan fill="#7C3AED">AI</tspan>
  </text>
  <text x="642" y="1540" font-family="system-ui, sans-serif" font-size="28" font-weight="400" text-anchor="middle" fill="#6B7280" letter-spacing="3">
    INTERACTIVE TECH EDUCATION
  </text>
</svg>`;

const ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" fill="none">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#030303"/>
      <stop offset="100%" stop-color="#0A0A1A"/>
    </linearGradient>
    <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7C3AED"/>
      <stop offset="50%" stop-color="#6D28D9"/>
      <stop offset="100%" stop-color="#4F46E5"/>
    </linearGradient>
    <linearGradient id="gl" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A78BFA"/>
      <stop offset="100%" stop-color="#818CF8"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="220" fill="url(#bg)"/>
  <g transform="translate(256, 256) scale(12)">
    <path d="M24 12 L44 24 L24 36 L4 24 Z" fill="url(#lg)" opacity="0.9"/>
    <rect x="18" y="6" width="12" height="10" rx="2" fill="url(#lg)"/>
    <line x1="24" y1="10" x2="38" y2="4" stroke="url(#gl)" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="38" cy="4" r="3" fill="#A78BFA"/>
    <circle cx="12" cy="24" r="2.5" fill="white" opacity="0.9"/>
    <circle cx="24" cy="24" r="3" fill="white"/>
    <circle cx="36" cy="24" r="2.5" fill="white" opacity="0.9"/>
    <circle cx="18" cy="16" r="2" fill="white" opacity="0.7"/>
    <circle cx="30" cy="16" r="2" fill="white" opacity="0.7"/>
    <line x1="12" y1="24" x2="24" y2="24" stroke="white" stroke-width="1.2" opacity="0.5"/>
    <line x1="24" y1="24" x2="36" y2="24" stroke="white" stroke-width="1.2" opacity="0.5"/>
    <line x1="18" y1="16" x2="12" y2="24" stroke="white" stroke-width="1" opacity="0.4"/>
    <line x1="18" y1="16" x2="24" y2="24" stroke="white" stroke-width="1" opacity="0.4"/>
    <line x1="30" y1="16" x2="24" y2="24" stroke="white" stroke-width="1" opacity="0.4"/>
    <line x1="30" y1="16" x2="36" y2="24" stroke="white" stroke-width="1" opacity="0.4"/>
    <path d="M38 32 L40 28 L42 32 L46 34 L42 36 L40 40 L38 36 L34 34 Z" fill="url(#gl)" opacity="0.85"/>
  </g>
</svg>`;

const ADAPTIVE_FG = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" fill="none">
  <defs>
    <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7C3AED"/>
      <stop offset="50%" stop-color="#6D28D9"/>
      <stop offset="100%" stop-color="#4F46E5"/>
    </linearGradient>
    <linearGradient id="gl" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A78BFA"/>
      <stop offset="100%" stop-color="#818CF8"/>
    </linearGradient>
  </defs>
  <g transform="translate(256, 256) scale(12)">
    <path d="M24 12 L44 24 L24 36 L4 24 Z" fill="url(#lg)" opacity="0.9"/>
    <rect x="18" y="6" width="12" height="10" rx="2" fill="url(#lg)"/>
    <line x1="24" y1="10" x2="38" y2="4" stroke="url(#gl)" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="38" cy="4" r="3" fill="#A78BFA"/>
    <circle cx="12" cy="24" r="2.5" fill="white" opacity="0.9"/>
    <circle cx="24" cy="24" r="3" fill="white"/>
    <circle cx="36" cy="24" r="2.5" fill="white" opacity="0.9"/>
    <circle cx="18" cy="16" r="2" fill="white" opacity="0.7"/>
    <circle cx="30" cy="16" r="2" fill="white" opacity="0.7"/>
    <line x1="12" y1="24" x2="24" y2="24" stroke="white" stroke-width="1.2" opacity="0.5"/>
    <line x1="24" y1="24" x2="36" y2="24" stroke="white" stroke-width="1.2" opacity="0.5"/>
    <line x1="18" y1="16" x2="12" y2="24" stroke="white" stroke-width="1" opacity="0.4"/>
    <line x1="18" y1="16" x2="24" y2="24" stroke="white" stroke-width="1" opacity="0.4"/>
    <line x1="30" y1="16" x2="24" y2="24" stroke="white" stroke-width="1" opacity="0.4"/>
    <line x1="30" y1="16" x2="36" y2="24" stroke="white" stroke-width="1" opacity="0.4"/>
    <path d="M38 32 L40 28 L42 32 L46 34 L42 36 L40 40 L38 36 L34 34 Z" fill="url(#gl)" opacity="0.85"/>
  </g>
</svg>`;

const FAVICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <defs>
    <linearGradient id="fg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7C3AED"/>
      <stop offset="100%" stop-color="#4F46E5"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="url(#fg)"/>
  <path d="M16 8 L28 14 L16 20 L4 14 Z" fill="white" opacity="0.95"/>
  <rect x="12" y="5" width="8" height="6" rx="1" fill="white"/>
  <circle cx="9" cy="14" r="1.5" fill="white" opacity="0.7"/>
  <circle cx="16" cy="14" r="1.8" fill="white"/>
  <circle cx="23" cy="14" r="1.5" fill="white" opacity="0.7"/>
  <line x1="9" y1="14" x2="16" y2="14" stroke="white" stroke-width="0.8" opacity="0.5"/>
  <line x1="16" y1="14" x2="23" y2="14" stroke="white" stroke-width="0.8" opacity="0.5"/>
  <text x="16" y="28" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="white" text-anchor="middle" letter-spacing="1">AI</text>
</svg>`;

async function generate() {
  console.log('Generating PNG assets from SVG...\n');

  // 1. Mobile icon (1024x1024)
  const iconPath = resolve(ASSETS_DIR, 'icon.png');
  await sharp(Buffer.from(ICON_SVG)).resize(1024, 1024).png().toFile(iconPath);
  console.log(`  -> ${iconPath}`);

  // 2. Mobile adaptive icon foreground
  const adaptiveFgPath = resolve(ASSETS_DIR, 'images', 'android-icon-foreground.png');
  await sharp(Buffer.from(ADAPTIVE_FG)).resize(1024, 1024).png().toFile(adaptiveFgPath);
  console.log(`  -> ${adaptiveFgPath}`);

  // 3. Mobile splash (1284x2778)
  const splashPath = resolve(ASSETS_DIR, 'splash.png');
  await sharp(Buffer.from(SPLASH_SVG)).resize(1284, 2778).png().toFile(splashPath);
  console.log(`  -> ${splashPath}`);

  // 4. Web favicon (32x32)
  const faviconPath = resolve(PUBLIC_DIR, 'favicon.png');
  await sharp(Buffer.from(FAVICON_SVG)).resize(32, 32).png().toFile(faviconPath);
  console.log(`  -> ${faviconPath}`);

  // 5. Web apple-touch-icon (180x180)
  const appleIconPath = resolve(PUBLIC_DIR, 'apple-touch-icon.png');
  await sharp(Buffer.from(ICON_SVG)).resize(180, 180).png().toFile(appleIconPath);
  console.log(`  -> ${appleIconPath}`);

  console.log('\nDone! All assets generated.');
}

generate().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
