import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function optimizeImages() {
  const imagesDir = 'public/images';
  
  if (!fs.existsSync(imagesDir)) {
    console.log('No images directory found. Skipping optimization.');
    return;
  }
  
  const imageExtensions = ['.jpg', '.jpeg', '.png'];
  let optimizedCount = 0;
  
  async function processDirectory(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await processDirectory(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (imageExtensions.includes(ext)) {
          const webpPath = fullPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
          
          // Only optimize if WebP doesn't exist or source is newer
          if (!fs.existsSync(webpPath) || fs.statSync(fullPath).mtime > fs.statSync(webpPath).mtime) {
            try {
              const stats = fs.statSync(fullPath);
              await sharp(fullPath)
                .webp({ quality: 85 })
                .resize({ width: 1920, withoutEnlargement: true })
                .toFile(webpPath);
              
              const newStats = fs.statSync(webpPath);
              console.log(`✓ ${path.relative('public', webpPath)} (${Math.round(stats.size / 1024)}KB → ${Math.round(newStats.size / 1024)}KB)`);
              optimizedCount++;
            } catch (err: any) {
              console.error(`✗ Failed to optimize ${fullPath}: ${err.message}`);
            }
          }
        }
      }
    }
  }
  
  await processDirectory(imagesDir);
  
  if (optimizedCount === 0) {
    console.log('✅ All images already optimized');
  } else {
    console.log(`✅ Optimized ${optimizedCount} image(s)`);
  }
}

optimizeImages().catch(err => {
  console.error('Image optimization failed:', err);
  process.exit(1);
});
