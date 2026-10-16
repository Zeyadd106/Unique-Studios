const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SOURCE_DIR = path.join(ROOT, 'public', 'images', 'products');
const OUTPUT_DIR = path.join(ROOT, 'public', 'images', 'optimized');

const SOURCE_FILES = [
  'IMG_5531.JPG.jpeg',
  'IMG_5543.JPG.jpeg',
  'IMG_5544.JPG.jpeg',
  'IMG_5545.JPG.jpeg',
  'IMG_5546.JPG.jpeg',
  'IMG_5548.JPG.jpeg',
  'IMG_5549.JPG.jpeg',
  'IMG_5550.JPG.jpeg',
];

// suffix, width, height (2:3 cover crop), webp quality
const VARIANTS = [
  { suffix: 'card', width: 800, height: 1200, quality: 80 },
  { suffix: 'gallery', width: 1200, height: 1800, quality: 85 },
  { suffix: 'thumb', width: 300, height: 450, quality: 75 },
];

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function main() {
  // 1. Create output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Source dir :', SOURCE_DIR);
  console.log('Output dir :', OUTPUT_DIR);
  console.log('');

  let grandTotal = 0;
  let fileCount = 0;

  for (const sourceFile of SOURCE_FILES) {
    const sourcePath = path.join(SOURCE_DIR, sourceFile);

    // Strip the double extension: IMG_5531.JPG.jpeg -> IMG_5531
    const baseName = sourceFile.replace(/\.jpeg$/i, '').replace(/\.jpg$/i, '');

    console.log(`Processing ${sourceFile} ...`);

    for (const variant of VARIANTS) {
      const outputFile = `${baseName}-${variant.suffix}.webp`;
      const outputPath = path.join(OUTPUT_DIR, outputFile);

      // 2-3. Generate cover-cropped 2:3 WebP variant
      await sharp(sourcePath)
        .resize(variant.width, variant.height, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: variant.quality, effort: 4 })
        .toFile(outputPath);

      const stat = fs.statSync(outputPath);
      grandTotal += stat.size;
      fileCount += 1;

      console.log(
        `  ${outputFile}  ${variant.width}x${variant.height}  q${variant.quality}  ${formatBytes(stat.size)}`
      );
    }

    console.log('');
  }

  console.log('Done.');
  console.log(`Optimized files written: ${fileCount}`);
  console.log(`Total output size:       ${formatBytes(grandTotal)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
