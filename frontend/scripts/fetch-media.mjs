import fs from 'fs';
import path from 'path';
import https from 'https';

const MEDIA_DIR = path.resolve('../public/media');
const USER_AGENT = 'ArchitecturalMarketplace/1.0';

const VIDEOS = [
  { name: 'hero-bg.mp4', search: 'architecture building timelapse black white', minSize: 300 * 1024 },
  { name: 'studio-reel.mp4', search: 'architectural studio workspace black white', minSize: 300 * 1024 },
];

const IMAGES = [
  { name: 'arch-01.jpg', search: 'modern architecture building exterior black white photography', minSize: 100 * 1024 },
  { name: 'arch-02.jpg', search: 'architectural interior space minimal black white', minSize: 100 * 1024 },
  { name: 'arch-03.jpg', search: 'brutalist architecture concrete structure black white', minSize: 100 * 1024 },
  { name: 'arch-04.jpg', search: 'architectural detail geometric pattern black white', minSize: 100 * 1024 },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function checkVideoSignature(buffer) {
  // Check for ftyp signature in first 16 bytes (MP4/MOV)
  if (buffer.length < 16) return false;
  // ftyp box typically at offset 4: 'ftyp' (0x66 0x74 0x79 0x70)
  const ftypOffset = buffer.indexOf(Buffer.from('ftyp'));
  return ftypOffset >= 0 && ftypOffset < 16;
}

function checkJpegSignature(buffer) {
  // Check for JPEG signature: 0xFF 0xD8 0xFF
  if (buffer.length < 3) return false;
  return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
}

async function downloadFile(url, dest, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const req = https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            const redirectUrl = res.headers.location;
            if (redirectUrl) {
              file.close();
              fs.unlink(dest, () => {});
              downloadFile(redirectUrl, dest, retries).then(resolve).catch(reject);
              return;
            }
          }
          if (res.statusCode === 429) {
            file.close();
            fs.unlink(dest, () => {});
            reject(new Error('HTTP 429: Rate limited'));
            return;
          }
          if (res.statusCode !== 200) {
            file.close();
            fs.unlink(dest, () => {});
            reject(new Error(`HTTP ${res.statusCode}: ${url}`));
            return;
          }
          res.pipe(file);
          file.on('finish', () => file.close(resolve));
        });
        req.on('error', (err) => {
          file.close();
          fs.unlink(dest, () => {});
          reject(err);
        });
        req.setTimeout(60000, () => {
          req.destroy();
          file.close();
          fs.unlink(dest, () => {});
          reject(new Error('Download timeout'));
        });
      });
      return true;
    } catch (err) {
      if (attempt === retries) throw err;
      if (err.message.includes('429')) {
        const waitTime = 5000 * (attempt + 1);
        console.log(`  ⏳ Rate limited, waiting ${waitTime/1000}s before retry...`);
        await new Promise(r => setTimeout(r, waitTime));
      } else {
        throw err;
      }
    }
  }
  return false;
}

async function searchWikimedia(query, type) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    list: 'search',
    srsearch: query,
    srnamespace: 6, // File namespace
    srlimit: 10,
  });
  const url = `https://commons.wikimedia.org/w/api.php?${params}`;

  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.query?.search || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getFileInfo(title) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    titles: title,
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: 1920,
  });
  const url = `https://commons.wikimedia.org/w/api.php?${params}`;

  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query?.pages;
          if (!pages) return resolve(null);
          const page = Object.values(pages)[0];
          resolve(page.imageinfo?.[0] || null);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function fetchValidVideo(name, searchQuery, minSize) {
  console.log(`\n🔍 Searching for video: ${searchQuery}`);
  const results = await searchWikimedia(searchQuery, 'video');

  for (const result of results) {
    const info = await getFileInfo(result.title);
    if (!info || !info.url) continue;

    const mime = info.mime || '';
    if (!mime.includes('video/')) continue;
    if (info.size < minSize) continue;

    console.log(`  Found: ${result.title} (${(info.size/1024).toFixed(0)} KB, ${mime})`);

    const dest = path.join(MEDIA_DIR, name);
    await downloadFile(info.url, dest);

    const buffer = fs.readFileSync(dest);
    if (checkVideoSignature(buffer) && buffer.length >= minSize) {
      console.log(`  ✅ Valid: ${name} (${(buffer.length/1024).toFixed(0)} KB, ftyp signature OK)`);
      return true;
    } else {
      console.log(`  ❌ Invalid signature or too small, trying next...`);
      fs.unlinkSync(dest);
    }
  }
  return false;
}

async function fetchValidImage(name, searchQuery, minSize) {
  console.log(`\n🔍 Searching for image: ${searchQuery}`);
  const results = await searchWikimedia(searchQuery, 'image');

  for (const result of results) {
    const info = await getFileInfo(result.title);
    if (!info || !info.url) continue;

    const mime = info.mime || '';
    if (!mime.includes('image/jpeg') && !mime.includes('image/jpg')) continue;
    if (info.size < minSize) continue;

    console.log(`  Found: ${result.title} (${(info.size/1024).toFixed(0)} KB, ${mime})`);

    const dest = path.join(MEDIA_DIR, name);
    await downloadFile(info.url, dest);

    const buffer = fs.readFileSync(dest);
    if (checkJpegSignature(buffer) && buffer.length >= minSize) {
      console.log(`  ✅ Valid: ${name} (${(buffer.length/1024).toFixed(0)} KB, JPEG signature OK)`);
      return true;
    } else {
      console.log(`  ❌ Invalid signature or too small, trying next...`);
      fs.unlinkSync(dest);
    }
  }
  return false;
}

async function main() {
  ensureDir(MEDIA_DIR);
  console.log('📁 Media directory:', MEDIA_DIR);
  console.log('🌐 User-Agent:', USER_AGENT);

  console.log('\n=== FETCHING VIDEOS ===');
  for (const video of VIDEOS) {
    const success = await fetchValidVideo(video.name, video.search, video.minSize);
    if (!success) {
      console.log(`  ⚠️  Failed to fetch valid video: ${video.name}`);
    }
    await new Promise(r => setTimeout(r, 1000)); // Rate limit
  }

  console.log('\n=== FETCHING IMAGES ===');
  for (const image of IMAGES) {
    const success = await fetchValidImage(image.name, image.search, image.minSize);
    if (!success) {
      console.log(`  ⚠️  Failed to fetch valid image: ${image.name}`);
    }
    await new Promise(r => setTimeout(r, 1000)); // Rate limit
  }

  console.log('\n=== VERIFICATION ===');
  const files = fs.readdirSync(MEDIA_DIR);
  for (const file of files) {
    const fullPath = path.join(MEDIA_DIR, file);
    const stats = fs.statSync(fullPath);
    const buffer = fs.readFileSync(fullPath);
    const isVideo = file.endsWith('.mp4');
    const valid = isVideo ? checkVideoSignature(buffer) : checkJpegSignature(buffer);
    console.log(`  ${file}: ${(stats.size/1024).toFixed(0)} KB ${valid ? '✅' : '❌'}`);
  }

  console.log('\n✨ Done!');
}

main().catch(console.error);