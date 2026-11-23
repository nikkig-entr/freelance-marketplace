const sharp = require('sharp');

async function createOGImage() {
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#1e293b"/>
      <rect x="0" y="0" width="1200" height="630" fill="url(#grad)"/>
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
        </linearGradient>
      </defs>
      <text x="600" y="280" font-family="system-ui, sans-serif" font-size="64" font-weight="bold" fill="#ffffff" text-anchor="middle">FreelanceHub</text>
      <text x="600" y="360" font-family="system-ui, sans-serif" font-size="28" fill="#22d3ee" text-anchor="middle">Find Work. Build Your Career.</text>
      <circle cx="600" cy="480" r="60" fill="#0ea5e9" opacity="0.3"/>
      <text x="600" y="485" font-family="system-ui, sans-serif" font-size="20" fill="#ffffff" text-anchor="middle">50K+ Professionals</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .webp({ quality: 90 })
    .toFile('C:\\Users\\kloop\\Desktop\\freelance\\freelance-marketplace\\frontend\\public\\media\\placeholders\\og-image.webp');

  console.log('OG image created');
}

createOGImage().catch(console.error);