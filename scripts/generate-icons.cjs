/**
 * Generates PWA icons for the Shadow app.
 * Design: black background, ember-red crescent/half-circle motif
 * representing duality (shadow / conscious self).
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function crc32(buffer) {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buffer[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const lengthBuffer = Buffer.allocUnsafe(4);
  lengthBuffer.writeUInt32BE(data.length, 0);
  const crcData = Buffer.concat([typeBuffer, data]);
  const crcValue = crc32(crcData);
  const crcBuffer = Buffer.allocUnsafe(4);
  crcBuffer.writeUInt32BE(crcValue, 0);
  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

/**
 * Draws a Shadow app icon:
 * - True black background
 * - A ring (annulus) in ember red: left half bright, right half dim
 *   — evoking shadow/light duality
 * - For maskable variant, design stays within the 80% safe zone
 */
function generateIcon(size, isMaskable) {
  const pixels = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;

  // Scale design to safe zone if maskable (80% of size)
  const scale = isMaskable ? 0.8 : 1.0;
  const outerR = size * 0.38 * scale;
  const innerR = size * 0.22 * scale;

  // Ember red palette
  const brightR = [232, 58, 58, 255]; // #e83a3a — lit side
  const dimR = [100, 20, 20, 255]; // #641414 — shadow side

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default: black background
      pixels[idx] = 0;
      pixels[idx + 1] = 0;
      pixels[idx + 2] = 0;
      pixels[idx + 3] = 255;

      if (dist <= outerR && dist > innerR) {
        // Annulus (ring)
        if (dx <= 0) {
          // Left half — bright
          pixels[idx] = brightR[0];
          pixels[idx + 1] = brightR[1];
          pixels[idx + 2] = brightR[2];
          pixels[idx + 3] = brightR[3];
        } else {
          // Right half — dim shadow
          pixels[idx] = dimR[0];
          pixels[idx + 1] = dimR[1];
          pixels[idx + 2] = dimR[2];
          pixels[idx + 3] = dimR[3];
        }
      }
    }
  }

  // Build PNG chunks
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.allocUnsafe(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw scanlines: filter byte (0 = None) + RGBA row data
  const rowSize = size * 4;
  const rawData = Buffer.alloc(size * (rowSize + 1));
  for (let y = 0; y < size; y++) {
    rawData[y * (rowSize + 1)] = 0; // filter: None
    pixels.copy(rawData, y * (rowSize + 1) + 1, y * rowSize, (y + 1) * rowSize);
  }
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idat = makeChunk('IDAT', compressed);

  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), generateIcon(192, false));
console.log('✓ icon-192.png (192×192)');

fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), generateIcon(512, false));
console.log('✓ icon-512.png (512×512)');

fs.writeFileSync(path.join(iconsDir, 'icon-512-maskable.png'), generateIcon(512, true));
console.log('✓ icon-512-maskable.png (512×512 maskable)');

console.log('Done.');
