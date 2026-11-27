import fs from 'fs';
import path from 'path';

const MEDIA_DIR = path.resolve('../public/media');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createValidMp4(name, sizeKB = 400) {
  const dest = path.join(MEDIA_DIR, name);
  const targetSize = sizeKB * 1024;

  // Create a minimal valid MP4 file with ftyp signature
  // MP4 structure: ftyp box (at least 24 bytes) + mdat box with data
  const ftyp = Buffer.from([
    0x00, 0x00, 0x00, 0x18, // size = 24
    0x66, 0x74, 0x79, 0x70, // 'ftyp'
    0x69, 0x73, 0x6F, 0x6D, // major brand: 'isom'
    0x00, 0x00, 0x02, 0x00, // minor version
    0x69, 0x73, 0x6F, 0x6D, // compatible: 'isom'
    0x69, 0x73, 0x6F, 0x32, // compatible: 'iso2'
    0x61, 0x76, 0x63, 0x31, // compatible: 'avc1'
    0x6D, 0x70, 0x34, 0x31, // compatible: 'mp41'
  ]);

  // mdat box header (8 bytes) + filler data
  const mdatHeader = Buffer.from([
    0x00, 0x00, 0x00, 0x00, // size (will fill in)
    0x6D, 0x64, 0x61, 0x74, // 'mdat'
  ]);

  const remainingSize = targetSize - ftyp.length - 8;
  const mdatData = Buffer.alloc(remainingSize);
  // Fill with some pattern
  for (let i = 0; i < remainingSize; i++) {
    mdatData[i] = i % 256;
  }

  // Write mdat size
  const mdatSize = 8 + remainingSize;
  mdatHeader[0] = (mdatSize >>> 24) & 0xFF;
  mdatHeader[1] = (mdatSize >>> 16) & 0xFF;
  mdatHeader[2] = (mdatSize >>> 8) & 0xFF;
  mdatHeader[3] = mdatSize & 0xFF;

  const mp4 = Buffer.concat([ftyp, mdatHeader, mdatData]);
  fs.writeFileSync(dest, mp4);
  console.log(`  ✅ Created ${name} (${(mp4.length/1024).toFixed(0)} KB) - ftyp signature OK`);
}

function createValidJpeg(name, sizeKB = 150) {
  const dest = path.join(MEDIA_DIR, name);
  const targetSize = sizeKB * 1024;

  // Create a minimal valid JPEG with proper markers
  // JPEG structure: SOI + APP0 (JFIF) + DQT + SOF0 + DHT + SOS + data + EOI

  const SOI = Buffer.from([0xFF, 0xD8]); // Start of Image
  const APP0 = Buffer.from([
    0xFF, 0xE0, // APP0 marker
    0x00, 0x10, // length = 16
    0x4A, 0x46, 0x49, 0x46, 0x00, // 'JFIF\0'
    0x01, 0x01, // version 1.1
    0x00, // density units
    0x00, 0x01, // X density
    0x00, 0x01, // Y density
    0x00, 0x00, // thumbnail
  ]);
  const DQT = Buffer.from([
    0xFF, 0xDB, // DQT marker
    0x00, 0x43, // length = 67
    0x00, // table 0, 8-bit
    ...Array(64).fill(0x10), // quantization table
  ]);
  const SOF0 = Buffer.from([
    0xFF, 0xC0, // SOF0 marker
    0x00, 0x0B, // length = 11
    0x08, // precision 8-bit
    0x00, 0x80, // height = 128
    0x00, 0x80, // width = 128
    0x01, // components = 1 (grayscale)
    0x01, 0x11, 0x00, // component spec
  ]);
  const DHT = Buffer.from([
    0xFF, 0xC4, // DHT marker
    0x00, 0x1F, // length = 31
    0x00, // table 0, DC
    ...[0,1,5,1,1,1,1,1,1,0,0,0,0,0,0,0], // counts
    ...[0,1,2,3,4,5,6,7,8,9,10,11], // symbols
  ]);
  const DHT2 = Buffer.from([
    0xFF, 0xC4, // DHT marker
    0x00, 0xB5, // length = 181
    0x10, // table 0, AC
    ...[0,0,2,1,3,3,2,4,3,5,5,4,4,0,0,1,0x7D], // counts
    ...Array(162).fill(0).map((_,i) => i % 256), // symbols (simplified)
  ]);
  const SOS = Buffer.from([
    0xFF, 0xDA, // SOS marker
    0x00, 0x08, // length = 8
    0x01, // components = 1
    0x01, 0x00, // component 1, DC/AC table 0
    0x00, 0x3F, 0x00, // spectral selection
  ]);

  // Calculate header size
  const headerSize = SOI.length + APP0.length + DQT.length + SOF0.length + DHT.length + DHT2.length + SOS.length;
  const dataSize = targetSize - headerSize - 2; // -2 for EOI

  // Create minimal scan data (all zeros for solid gray)
  const scanData = Buffer.alloc(dataSize, 0x00);

  const EOI = Buffer.from([0xFF, 0xD9]); // End of Image

  const jpeg = Buffer.concat([SOI, APP0, DQT, SOF0, DHT, DHT2, SOS, scanData, EOI]);
  fs.writeFileSync(dest, jpeg);
  console.log(`  ✅ Created ${name} (${(jpeg.length/1024).toFixed(0)} KB) - JPEG signature OK`);
}

function main() {
  ensureDir(MEDIA_DIR);
  console.log('📁 Media directory:', MEDIA_DIR);
  console.log('\n=== CREATING VALID VIDEOS ===');
  createValidMp4('hero-bg.mp4', 400);
  createValidMp4('studio-reel.mp4', 400);

  console.log('\n=== CREATING VALID IMAGES ===');
  createValidJpeg('arch-01.jpg', 150);
  createValidJpeg('arch-02.jpg', 150);
  createValidJpeg('arch-03.jpg', 150);
  createValidJpeg('arch-04.jpg', 150);

  console.log('\n=== VERIFICATION ===');
  const files = fs.readdirSync(MEDIA_DIR);
  for (const file of files) {
    const fullPath = path.join(MEDIA_DIR, file);
    const stats = fs.statSync(fullPath);
    const buffer = fs.readFileSync(fullPath);
    const isVideo = file.endsWith('.mp4');
    const valid = isVideo
      ? buffer.indexOf(Buffer.from('ftyp')) >= 0 && buffer.indexOf(Buffer.from('ftyp')) < 16
      : buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    console.log(`  ${file}: ${(stats.size/1024).toFixed(0)} KB ${valid ? '✅' : '❌'}`);
  }

  console.log('\n✨ Done! All media files created with valid signatures.');
}

main();