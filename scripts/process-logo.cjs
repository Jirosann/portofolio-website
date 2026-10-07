const sharp = require('sharp');
const path = require('path');

const input = 'C:\\Users\\ASUS\\Project\\Portofolio Website\\Dokumentasi\\Al-Qadri Logo.jpg';
const output = path.join(process.cwd(), 'public/brand/al-qadri-logo.webp');

async function processImage() {
  try {
    const metadata = await sharp(input).metadata();
    console.log(`Original size: ${metadata.width}x${metadata.height}`);
    
    // We want a square from the center. 
    // The height is the limiting factor for a wide image.
    const size = Math.min(metadata.width, metadata.height);
    
    await sharp(input)
      .extract({
        left: Math.floor((metadata.width - size) / 2),
        top: Math.floor((metadata.height - size) / 2),
        width: size,
        height: size
      })
      .resize(128, 128)
      .webp({ quality: 80 })
      .toFile(output);
      
    console.log('Successfully created', output);
  } catch (err) {
    console.error(err);
  }
}

processImage();
