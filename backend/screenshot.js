import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';

/**
 * Takes a screenshot of a web page using Puppeteer
 * @param {string} pageUrl - The URL of the page to screenshot
 * @param {string} outputPath - The path where the screenshot should be saved
 * @param {Object} options - Screenshot options
 * @returns {Promise<void>}
 */
export async function takeScreenshot(pageUrl, outputPath, options = {}) {
  let browser = null;
  
  try {
    console.log(`Taking screenshot of: ${pageUrl}`);
    
    // Validate URL
    if (!pageUrl || typeof pageUrl !== 'string') {
      throw new Error('Invalid page URL provided');
    }

    // Ensure the output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.ensureDir(outputDir);

    // Default options optimized for free tier
    const defaultOptions = {
      viewport: {
        width: 1280,
        height: 720
      },
      waitForSelector: null, // Optional: wait for specific element
      waitTime: 3000, // Wait time after page load
      fullPage: false,
      quality: 80, // Lower quality for free tier
      type: 'png'
    };

    const screenshotOptions = { ...defaultOptions, ...options };

    // Launch browser with free tier optimizations
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--memory-pressure-off',
        '--max_old_space_size=512' // Limit memory usage
      ]
    });

    // Create new page
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport(screenshotOptions.viewport);
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Set resource limits for free tier
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      // Block unnecessary resources to save memory
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Navigate to the page with shorter timeout for free tier
    console.log('Navigating to page...');
    const response = await page.goto(pageUrl, {
      waitUntil: 'domcontentloaded', // Faster than networkidle2
      timeout: 20000 // Shorter timeout for free tier
    });

    if (!response || !response.ok()) {
      throw new Error(`Failed to load page: ${response ? response.status() : 'No response'} ${response ? response.statusText() : ''}`);
    }

    // Wait for specific selector if provided
    if (screenshotOptions.waitForSelector) {
      console.log(`Waiting for selector: ${screenshotOptions.waitForSelector}`);
      try {
        await page.waitForSelector(screenshotOptions.waitForSelector, { timeout: 8000 });
      } catch (error) {
        console.log(`Selector not found, continuing anyway: ${error.message}`);
      }
    }

    // Wait additional time for any dynamic content
    if (screenshotOptions.waitTime > 0) {
      console.log(`Waiting ${screenshotOptions.waitTime}ms for content to load...`);
      await page.waitForTimeout(screenshotOptions.waitTime);
    }

    // Take screenshot
    console.log('Taking screenshot...');
    const screenshotOptionsForPuppeteer = {
      path: outputPath,
      fullPage: screenshotOptions.fullPage,
      type: screenshotOptions.type
    };

    if (screenshotOptions.type === 'jpeg') {
      screenshotOptionsForPuppeteer.quality = screenshotOptions.quality;
    }

    await page.screenshot(screenshotOptionsForPuppeteer);
    
    console.log(`Screenshot saved to: ${outputPath}`);
    
    // Verify the file was created and has content
    const stats = await fs.stat(outputPath);
    if (stats.size === 0) {
      throw new Error('Screenshot file is empty');
    }
    
    console.log(`Screenshot file size: ${stats.size} bytes`);

  } catch (error) {
    console.error('Error taking screenshot:', error);
    throw new Error(`Failed to take screenshot: ${error.message}`);
  } finally {
    // Always close the browser
    if (browser) {
      console.log('Closing browser...');
      try {
        await browser.close();
      } catch (error) {
        console.log('Error closing browser:', error.message);
      }
    }
  }
}

/**
 * Takes a screenshot with retry logic optimized for free tier
 * @param {string} pageUrl - The URL of the page to screenshot
 * @param {string} outputPath - The path where the screenshot should be saved
 * @param {Object} options - Screenshot options
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<void>}
 */
export async function takeScreenshotWithRetry(pageUrl, outputPath, options = {}, maxRetries = 2) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await takeScreenshot(pageUrl, outputPath, options);
      return; // Success, exit the retry loop
    } catch (error) {
      lastError = error;
      console.log(`Screenshot attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < maxRetries) {
        // Wait before retrying (shorter delay for free tier)
        const delay = Math.pow(2, attempt) * 500;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Failed to take screenshot after ${maxRetries} attempts. Last error: ${lastError.message}`);
}

/**
 * Takes a full-page screenshot
 * @param {string} pageUrl - The URL of the page to screenshot
 * @param {string} outputPath - The path where the screenshot should be saved
 * @param {Object} options - Additional options
 * @returns {Promise<void>}
 */
export async function takeFullPageScreenshot(pageUrl, outputPath, options = {}) {
  return takeScreenshot(pageUrl, outputPath, {
    ...options,
    fullPage: true
  });
} 