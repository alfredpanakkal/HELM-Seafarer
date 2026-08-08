import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.resolve('public');
const SVG_ICON_PATH = path.join(PUBLIC_DIR, 'icon.svg');

async function main() {
  console.log('🚀 Starting PWA & Play Store asset generation...');

  if (!fs.existsSync(SVG_ICON_PATH)) {
    console.error(`❌ Error: Vector icon not found at ${SVG_ICON_PATH}`);
    process.exit(1);
  }

  // 1. Generate icon-192.png
  console.log('🎨 Generating icon-192.png (192x192)...');
  await sharp(SVG_ICON_PATH)
    .resize(192, 192)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'icon-192.png'));

  // 2. Generate icon-512.png
  console.log('🎨 Generating icon-512.png (512x512)...');
  await sharp(SVG_ICON_PATH)
    .resize(512, 512)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'icon-512.png'));

  // 3. Generate icon-maskable-512.png (with slightly padded safe area)
  console.log('🎨 Generating icon-maskable-512.png (512x512)...');
  // Since our icon.svg already has a wide safe margin (the anchor circle has radius 180 within a 512 width, meaning 360/512 = 70% content area, which perfectly satisfies the PWA 60% safe area for maskable icons!), we can just output it as a PNG directly.
  await sharp(SVG_ICON_PATH)
    .resize(512, 512)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'icon-maskable-512.png'));

  // 4. Generate feature-graphic.png (1024x500)
  console.log('🎨 Generating feature-graphic.png (1024x500)...');
  const featureGraphicSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 500" width="1024" height="500">
      <defs>
        <!-- Background Gradient -->
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1E293B" />
          <stop offset="100%" stop-color="#0F172A" />
        </linearGradient>
        <linearGradient id="anchorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FF7875" />
          <stop offset="100%" stop-color="#FF4D4F" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Background -->
      <rect width="1024" height="500" fill="url(#bgGrad)" />

      <!-- Accent Circle -->
      <circle cx="768" cy="250" r="180" fill="none" stroke="#FF4D4F" stroke-width="4" stroke-opacity="0.15" />

      <!-- Anchor Icon (positioned on the right side) -->
      <g transform="translate(618, 100) scale(0.58)" filter="url(#glow)">
        <!-- Anchor Ring -->
        <circle cx="256" cy="130" r="30" fill="none" stroke="url(#anchorGrad)" stroke-width="24" />
        <!-- Anchor Shank (Vertical shaft) -->
        <line x1="256" y1="160" x2="256" y2="350" stroke="url(#anchorGrad)" stroke-width="24" stroke-linecap="round" />
        <!-- Anchor Stock (Horizontal bar) -->
        <line x1="180" y1="190" x2="332" y2="190" stroke="url(#anchorGrad)" stroke-width="20" stroke-linecap="round" />
        <circle cx="170" cy="190" r="14" fill="url(#anchorGrad)" />
        <circle cx="342" cy="190" r="14" fill="url(#anchorGrad)" />
        <!-- Anchor Flukes (The curved bottom) -->
        <path d="M 120 280 C 120 400, 392 400, 392 280" fill="none" stroke="url(#anchorGrad)" stroke-width="24" stroke-linecap="round" />
        <!-- Left fluke tip -->
        <path d="M 120 280 L 100 250 L 140 250 Z" fill="url(#anchorGrad)" />
        <!-- Right fluke tip -->
        <path d="M 392 280 L 372 250 L 412 250 Z" fill="url(#anchorGrad)" />
        <!-- Anchor Center Diamond -->
        <polygon points="256,290 270,310 256,330 242,310" fill="#FFFFFF" opacity="0.9" />
      </g>

      <!-- Title Text -->
      <text x="100" y="215" font-family="'Poppins', 'Inter', sans-serif" font-weight="bold" font-size="54" fill="#FFFFFF" letter-spacing="-1">Seafarer Calc</text>
      <text x="100" y="270" font-family="'Poppins', 'Inter', sans-serif" font-weight="600" font-size="22" fill="#FF4D4F" letter-spacing="2">NRI &amp; SEATIME ANALYTICS</text>
      <text x="100" y="315" font-family="'Inter', sans-serif" font-size="16" fill="#64748B" font-weight="normal">Professional tracker &amp; tax estimator for Indian seafarers</text>
    </svg>
  `;

  await sharp(Buffer.from(featureGraphicSvg))
    .png()
    .toFile(path.join(PUBLIC_DIR, 'feature-graphic.png'));

  console.log('✅ Asset generation completed successfully!');
  console.log('📁 Outputs saved in /public:');
  console.log('  - icon-192.png');
  console.log('  - icon-512.png');
  console.log('  - icon-maskable-512.png');
  console.log('  - feature-graphic.png');
}

main().catch((err) => {
  console.error('❌ Asset generation failed:', err);
  process.exit(1);
});
