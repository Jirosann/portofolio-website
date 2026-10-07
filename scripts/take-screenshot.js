import puppeteer from 'puppeteer';

(async () => {
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('Navigating to TB Detector...');
    await page.goto('https://project-ai-front-end.vercel.app/', { waitUntil: 'networkidle2' });
    
    // Wait an extra 2 seconds for any animations/models to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const outputPath = 'public/projects/tb-detector/preview.webp';
    console.log(`Taking screenshot to ${outputPath}...`);
    
    await page.screenshot({ path: outputPath, type: 'webp' });
    
    await browser.close();
    console.log('Screenshot saved successfully!');
  } catch (error) {
    console.error('Failed to take screenshot:', error);
    process.exit(1);
  }
})();
