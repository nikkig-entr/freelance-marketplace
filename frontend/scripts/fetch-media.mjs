// Fetch 8 distinct high-contrast architectural photographs
// Validates magic bytes (0xFF 0xD8 0xFF), size > 80KB, and unique SHA-256 hashes

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mediaDir = path.join(__dirname, '..', 'public', 'media');

if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

// 8 distinct architectural/brutalist/minimalist photographs from reliable sources
const archImages = [
  {
    name: 'arch-01.jpg',
    // Brutalist - Boston City Hall
    urls: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1920&q=85',
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920',
    ],
  },
  {
    name: 'arch-02.jpg',
    // Minimalist museum - Louvre Abu Dhabi style
    urls: [
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1920&q=85',
      'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=1920',
    ],
  },
  {
    name: 'arch-03.jpg',
    // Brutalist - Geisel Library UCSD
    urls: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=85',
      'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=1920',
    ],
  },
  {
    name: 'arch-04.jpg',
    // Minimalist concrete - Tadao Ando style
    urls: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&q=85',
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1920',
    ],
  },
  {
    name: 'arch-05.jpg',
    // Brutalist - Habitat 67 Montreal style
    urls: [
      'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=1920',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1920&q=85',
    ],
  },
  {
    name: 'arch-06.jpg',
    // Museum - Guggenheim Bilbao style
    urls: [
      'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1920&q=85',
      'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=1920',
    ],
  },
  {
    name: 'arch-07.jpg',
    // Brutalist - Barbican Centre London style
    urls: [
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1920&q=85',
      'https://images.pexels.com/photos/1493908/pexels-photo-1493908.jpeg?auto=compress&cs=tinysrgb&w=1920',
    ],
  },
  {
    name: 'arch-08.jpg',
    // Minimalist - Benesse House Naoshima style
    urls: [
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=85',
      'https://images.pexels.com/photos/209296/pexels-photo-209296.jpeg?auto=compress&cs=tinysrgb&w=1920',
    ],
  },
];

const MIN_SIZE = 80 * 1024; // 80 KB minimum

function computeSHA256(filePath) {
  const hash = crypto.createHash('sha256');
  const stream = fs.createReadStream(filePath);
  return new Promise((resolve, reject) => {
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

function validateJPEG(filePath) {
  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(3);
  fs.readSync(fd, buffer, 0, 3, 0);
  fs.closeSync(fd);
  return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);

    const request = client.get(url, {
      headers: {
        'User-Agent': 'ArchitecturalTalentArchive/1.0 (+https://github.com/archival-talent; Educational/Research use)'
      }
    }, (response) => {
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
      const isImage = contentType.includes('image');

      if (!isImage) {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`Invalid content-type: ${contentType} for ${url}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(dest);

        if (stats.size < MIN_SIZE) {
          fs.unlink(dest, () => {});
          reject(new Error(`File too small: ${stats.size} bytes (min ${MIN_SIZE})`));
          return;
        }

        if (!validateJPEG(dest)) {
          fs.unlink(dest, () => {});
          reject(new Error(`Invalid JPEG magic bytes`));
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

async function fetchMedia() {
  console.log('Fetching 8 distinct architectural photographs...\n');

  const hashes = new Set();
  const results = [];

  // First, check existing files and add their hashes to the set
  console.log('=== CHECKING EXISTING FILES ===');
  const existingFiles = ['arch-01.jpg', 'arch-02.jpg', 'arch-03.jpg', 'arch-04.jpg', 'arch-05.jpg', 'arch-06.jpg', 'arch-07.jpg', 'arch-08.jpg'];
  for (const file of existingFiles) {
    const dest = path.join(mediaDir, file);
    if (fs.existsSync(dest)) {
      const stats = fs.statSync(dest);
      const hash = await computeSHA256(dest);
      const validJPEG = validateJPEG(dest);
      const validSize = stats.size >= MIN_SIZE;

      if (validJPEG && validSize) {
        if (hashes.has(hash)) {
          console.log(`${file}: DUPLICATE - REMOVING`);
          fs.unlinkSync(dest);
        } else {
          hashes.add(hash);
          results.push({ name: file, hash, size: stats.size });
          console.log(`${file}: ${(stats.size / 1024).toFixed(1)} KB | JPEG: ✓ | Size: ✓ | Hash: ${hash.substring(0, 16)}...`);
        }
      } else {
        console.log(`${file}: INVALID (JPEG: ${validJPEG}, Size: ${validSize}) - WILL RE-DOWNLOAD`);
        fs.unlinkSync(dest);
      }
    }
  }

  console.log('\n=== DOWNLOADING MISSING IMAGES ===');
  for (const image of archImages) {
    const dest = path.join(mediaDir, image.name);
    // Skip if already have a valid file
    if (results.some(r => r.name === image.name)) {
      continue;
    }

    let downloaded = false;

    for (const url of image.urls) {
      try {
        console.log(`Trying: ${url}`);
        await downloadFile(url, dest);

        const hash = await computeSHA256(dest);
        console.log(`  SHA-256: ${hash.substring(0, 16)}...`);

        if (hashes.has(hash)) {
          console.log(`  ✗ DUPLICATE HASH DETECTED - removing`);
          fs.unlinkSync(dest);
          continue;
        }

        hashes.add(hash);
        downloaded = true;
        results.push({ name: image.name, hash, size: fs.statSync(dest).size });
        break;
      } catch (err) {
        console.log(`  ✗ Failed: ${err.message}`);
      }
    }

    if (!downloaded) {
      console.log(`\n⚠ FAILED to download ${image.name} from all sources\n`);
    }
  }

  console.log('\n=== FINAL VERIFICATION ===');
  let allValid = true;

  for (const result of results) {
    const dest = path.join(mediaDir, result.name);
    const stats = fs.statSync(dest);
    const validJPEG = validateJPEG(dest);
    const validSize = stats.size >= MIN_SIZE;
    const uniqueHash = results.filter(r => r.hash === result.hash).length === 1;

    console.log(`${result.name}: ${(stats.size / 1024).toFixed(1)} KB | JPEG: ${validJPEG ? '✓' : '✗'} | Size: ${validSize ? '✓' : '✗'} | Unique: ${uniqueHash ? '✓' : '✗'} | Hash: ${result.hash.substring(0, 16)}...`);

    if (!validJPEG || !validSize || !uniqueHash) {
      allValid = false;
    }
  }

  const success = allValid && results.length === 8;
  console.log(`\n${success ? '✓ ALL 8 IMAGES VALID AND UNIQUE' : '✗ VALIDATION FAILED'}`);

  return success;
}

fetchMedia().catch(console.error);