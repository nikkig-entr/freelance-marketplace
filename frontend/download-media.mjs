// Media download script for frontend/public/media/
// Using coverr.co and pixabay for videos (more stable direct URLs)

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mediaDir = path.join(__dirname, 'public', 'media');

if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

// Using coverr.co and other sources with stable direct video URLs
const mediaFiles = [
  {
    name: 'hero-bg.mp4',
    // Coverr.co - architecture, minimal, light/shadow
    urls: [
      'https://assets.coverr.co/videos/architecture-building-construction?format=mp4',
      'https://assets.coverr.co/videos/minimal-architecture-interior?format=mp4',
      'https://assets.coverr.co/videos/modern-architecture-building?format=mp4',
      'https://assets.coverr.co/videos/architectural-space-light?format=mp4',
      // Pixabay videos
      'https://cdn.pixabay.com/video/2023/10/13/135696-854386210_large.mp4',
      'https://cdn.pixabay.com/video/2022/11/29/134616-742874458_large.mp4',
    ],
    type: 'video',
    minSize: 100 * 1024,
  },
  {
    name: 'studio-reel.mp4',
    // Coverr.co - architectural space, production
    urls: [
      'https://assets.coverr.co/videos/architectural-design-studio?format=mp4',
      'https://assets.coverr.co/videos/architecture-office-space?format=mp4',
      'https://assets.coverr.co/videos/minimalist-interior-design?format=mp4',
      'https://cdn.pixabay.com/video/2023/02/26/112056-690861238_large.mp4',
      'https://cdn.pixabay.com/video/2022/10/15/133576-719695866_large.mp4',
    ],
    type: 'video',
    minSize: 100 * 1024,
  },
  {
    name: 'arch-01.jpg',
    urls: [
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920',
      'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=1920',
      'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=1920',
    ],
    type: 'image',
    minSize: 100 * 1024,
  },
  {
    name: 'arch-02.jpg',
    urls: [
      'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=1920',
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920',
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1920',
    ],
    type: 'image',
    minSize: 100 * 1024,
  },
  {
    name: 'arch-03.jpg',
    urls: [
      'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=1920',
      'https://images.pexels.com/photos/1493908/pexels-photo-1493908.jpeg?auto=compress&cs=tinysrgb&w=1920',
      'https://images.pexels.com/photos/209296/pexels-photo-209296.jpeg?auto=compress&cs=tinysrgb&w=1920',
    ],
    type: 'image',
    minSize: 100 * 1024,
  },
  {
    name: 'arch-04.jpg',
    urls: [
      'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1920',
      'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=1920',
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1920',
    ],
    type: 'image',
    minSize: 100 * 1024,
  },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);

    const request = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          fs.unlink(dest, () => {});
          downloadFile(redirectUrl, dest).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
        return;
      }

      const contentType = response.headers['content-type'] || '';
      const isVideo = contentType.includes('video');
      const isImage = contentType.includes('image');

      if (!isVideo && !isImage) {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`Invalid content-type: ${contentType} for ${url}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(dest);
        if (stats.size < 100 * 1024) {
          fs.unlink(dest, () => {});
          reject(new Error(`File too small: ${stats.size} bytes`));
          return;
        }
        console.log(`✓ Downloaded: ${path.basename(dest)} (${(stats.size / 1024).toFixed(1)} KB, ${contentType})`);
        resolve({ path: dest, size: stats.size, contentType });
      });
    });

    request.on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });

    request.setTimeout(120000, () => {
      request.destroy();
      file.close();
      fs.unlink(dest, () => {});
      reject(new Error(`Timeout: ${url}`));
    });
  });
}

async function downloadMedia() {
  console.log('Starting media download...\n');

  for (const media of mediaFiles) {
    const dest = path.join(mediaDir, media.name);
    let downloaded = false;

    for (const url of media.urls) {
      try {
        console.log(`Trying: ${url}`);
        await downloadFile(url, dest);
        downloaded = true;
        break;
      } catch (err) {
        console.log(`  ✗ Failed: ${err.message}`);
      }
    }

    if (!downloaded) {
      console.log(`\n⚠ FAILED to download ${media.name} from all sources\n`);
    }
  }

  console.log('\nDone! Checking final files...');

  // Verify all files
  for (const media of mediaFiles) {
    const dest = path.join(mediaDir, media.name);
    if (fs.existsSync(dest)) {
      const stats = fs.statSync(dest);
      console.log(`${media.name}: ${(stats.size / 1024).toFixed(1)} KB ${stats.size > media.minSize ? '✓' : '✗ TOO SMALL'}`);
    } else {
      console.log(`${media.name}: MISSING ✗`);
    }
  }
}

downloadMedia().catch(console.error);