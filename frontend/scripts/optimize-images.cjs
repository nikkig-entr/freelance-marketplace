const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const mediaDir = path.join(__dirname, '..', 'public', 'media');

const sections = ['hero', 'remote', 'community', 'projects', 'cta', 'placeholders'];

const sizes = {
  // Hero - large, full width
  hero: [1920, 1280, 960, 640, 384],
  // Remote - medium
  remote: [1280, 960, 640, 384],
  // Community - medium
  community: [1280, 960, 640, 384],
  // Projects - medium
  projects: [1280, 960, 640, 384],
  // CTA - large
  cta: [1920, 1280, 960, 640, 384],
  // Placeholders - small
  placeholders: [640, 384],
};

async function optimizeImage(inputPath, outputDir, baseName, section) {
  const widths = sizes[section] || [1280, 960, 640, 384];

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    console.log(`Processing ${baseName}: ${metadata.width}x${metadata.height}`);

    // Original as WebP (high quality)
    await image
      .webp({ quality: 85, effort: 6 })
      .toFile(path.join(outputDir, `${baseName}.webp`));
    console.log(`  ✓ ${baseName}.webp`);

    // AVIF version (better compression)
    await image
      .avif({ quality: 50, effort: 9 })
      .toFile(path.join(outputDir, `${baseName}.avif`));
    console.log(`  ✓ ${baseName}.avif`);

    // Responsive WebP variants
    for (const width of widths) {
      if (metadata.width > width) {
        await image
          .resize(width, null, { withoutEnlargement: true })
          .webp({ quality: 80, effort: 4 })
          .toFile(path.join(outputDir, `${baseName}-${width}w.webp`));
        console.log(`  ✓ ${baseName}-${width}w.webp`);
      }
    }

    // Thumbnail for placeholders
    await image
      .resize(400, 300, { fit: 'cover' })
      .webp({ quality: 70 })
      .toFile(path.join(outputDir, `${baseName}-thumb.webp`));
    console.log(`  ✓ ${baseName}-thumb.webp`);

  } catch (err) {
    console.error(`Error processing ${inputPath}:`, err.message);
  }
}

async function main() {
  for (const section of sections) {
    const sectionDir = path.join(mediaDir, section);
    if (!fs.existsSync(sectionDir)) continue;

    const files = fs.readdirSync(sectionDir)
      .filter(f => /\.(jpg|jpeg|png)$/i.test(f));

    console.log(`\n=== Processing ${section} (${files.length} files) ===`);

    for (const file of files) {
      const inputPath = path.join(sectionDir, file);
      const baseName = path.parse(file).name;
      await optimizeImage(inputPath, sectionDir, baseName, section);
    }
  }

  console.log('\n✅ Image optimization complete!');
}

main().catch(console.error);