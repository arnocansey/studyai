const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICON_PNG = path.join(__dirname, '../mobile/assets/icon.png');
const PUBLIC_DIR = path.join(__dirname, '../frontend/public');

async function generate() {
  console.log('Generating additional icon sizes...\n');

  const sizes = [16, 32, 48, 64, 128, 192, 256, 384, 512];
  const iconBuffer = fs.readFileSync(ICON_PNG);

  for (const size of sizes) {
    const outDir = path.join(PUBLIC_DIR, 'icons');
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `icon-${size}x${size}.png`);
    await sharp(iconBuffer).resize(size, size).png().toFile(outPath);
    console.log(`  -> icon-${size}x${size}.png`);
  }

  // Open Graph image (1200x630)
  const ogSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630' viewBox='0 0 1200 630' fill='none'>
    <defs>
      <linearGradient id='bg' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stop-color='#030303'/>
        <stop offset='50%' stop-color='#0A0A1A'/>
        <stop offset='100%' stop-color='#030303'/>
      </linearGradient>
      <linearGradient id='lg' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stop-color='#7C3AED'/>
        <stop offset='100%' stop-color='#4F46E5'/>
      </linearGradient>
    </defs>
    <rect width='1200' height='630' fill='url(#bg)'/>
    <circle cx='600' cy='280' r='200' fill='url(#lg)' opacity='0.08'/>
    <g transform='translate(460, 140) scale(8)'>
      <path d='M24 12 L44 24 L24 36 L4 24 Z' fill='url(#lg)' opacity='0.9'/>
      <rect x='18' y='6' width='12' height='10' rx='2' fill='url(#lg)'/>
      <circle cx='12' cy='24' r='2.5' fill='white' opacity='0.9'/>
      <circle cx='24' cy='24' r='3' fill='white'/>
      <circle cx='36' cy='24' r='2.5' fill='white' opacity='0.9'/>
      <line x1='12' y1='24' x2='24' y2='24' stroke='white' stroke-width='1.2' opacity='0.5'/>
      <line x1='24' y1='24' x2='36' y2='24' stroke='white' stroke-width='1.2' opacity='0.5'/>
    </g>
    <text x='600' y='440' font-family='system-ui, sans-serif' font-size='72' font-weight='700' letter-spacing='-1' text-anchor='middle'>
      <tspan fill='#EDEDED'>Study</tspan><tspan fill='#7C3AED'>AI</tspan>
    </text>
    <text x='600' y='490' font-family='system-ui, sans-serif' font-size='24' font-weight='400' text-anchor='middle' fill='#6B7280' letter-spacing='3'>INTERACTIVE TECH EDUCATION</text>
  </svg>`;

  const ogPath = path.join(PUBLIC_DIR, 'og-image.png');
  await sharp(Buffer.from(ogSvg)).resize(1200, 630).png().toFile(ogPath);
  console.log('  -> og-image.png');

  console.log('\nDone!');
}

generate().catch((e) => { console.error(e); process.exit(1); });
