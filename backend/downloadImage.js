import fetch from 'node-fetch';
import fs from 'fs-extra';
import path from 'path';

/**
 * Extracts file ID and node ID from a Figma URL
 * @param {string} figmaUrl - The Figma URL
 * @returns {Object} Object containing fileId and nodeId
 */
function extractFigmaIds(figmaUrl) {
  // Handle different Figma URL formats
  const patterns = [
    // Format: https://www.figma.com/design/FILE_ID/DESIGN_NAME?node-id=NODE_ID
    /figma\.com\/design\/([^\/]+)\/[^?]+\?node-id=([^&]+)/,
    // Format: https://www.figma.com/file/FILE_ID/DESIGN_NAME?node-id=NODE_ID
    /figma\.com\/file\/([^\/]+)\/[^?]+\?node-id=([^&]+)/,
    // Format: https://www.figma.com/proto/FILE_ID/DESIGN_NAME?node-id=NODE_ID
    /figma\.com\/proto\/([^\/]+)\/[^?]+\?node-id=([^&]+)/,
    // Format: https://www.figma.com/community/file/FILE_ID/DESIGN_NAME?node-id=NODE_ID
    /figma\.com\/community\/file\/([^\/]+)\/[^?]+\?node-id=([^&]+)/
  ];

  for (const pattern of patterns) {
    const match = figmaUrl.match(pattern);
    if (match) {
      return {
        fileId: match[1],
        nodeId: match[2]
      };
    }
  }

  throw new Error('Invalid Figma URL format. Please provide a valid Figma design URL with node-id parameter.');
}

/**
 * Converts a Figma URL to a direct image URL using Figma API
 * @param {string} figmaUrl - The Figma URL
 * @returns {Promise<string>} Direct image URL
 */
async function convertFigmaUrlToImageUrl(figmaUrl) {
  try {
    const { fileId, nodeId } = extractFigmaIds(figmaUrl);
    
    // Try multiple approaches to get the image URL
    
    // Approach 1: Direct Figma API (works for public files)
    try {
      const apiUrl = `https://www.figma.com/api/figma/1.0/images/${fileId}?ids=${nodeId}&format=png&scale=2`;
      console.log(`Trying Figma API: ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.images && data.images[nodeId]) {
          const imageUrl = data.images[nodeId];
          console.log(`Figma image URL obtained via API: ${imageUrl}`);
          return imageUrl;
        }
      }
    } catch (apiError) {
      console.log('Figma API approach failed, trying alternative methods...');
    }
    
    // Approach 2: Try to get the image URL from the Figma page
    try {
      console.log('Trying to extract image URL from Figma page...');
      const pageResponse = await fetch(figmaUrl);
      
      if (pageResponse.ok) {
        const html = await pageResponse.text();
        
        // Look for image URLs in the page content
        const imageUrlMatch = html.match(/https:\/\/[^"]*\.png[^"]*/);
        if (imageUrlMatch) {
          console.log(`Found image URL in page: ${imageUrlMatch[0]}`);
          return imageUrlMatch[0];
        }
      }
    } catch (pageError) {
      console.log('Page extraction approach failed...');
    }
    
    // If all approaches fail, provide helpful error message
    throw new Error(
      'Unable to convert Figma URL to image. This might be because:\n' +
      '1. The Figma file is private and requires authentication\n' +
      '2. The URL format is not supported\n' +
      '3. The node ID is invalid\n\n' +
      'Please try:\n' +
      '- Making the Figma file public\n' +
      '- Using a direct image URL instead\n' +
      '- Exporting the design as PNG and uploading it to an image host'
    );
    
  } catch (error) {
    console.error('Error converting Figma URL:', error);
    throw new Error(`Failed to convert Figma URL to image URL: ${error.message}`);
  }
}

/**
 * Downloads an image from a URL and saves it to the specified path
 * @param {string} imageUrl - The URL of the image to download (can be Figma URL or direct image URL)
 * @param {string} outputPath - The path where the image should be saved
 * @returns {Promise<void>}
 */
export async function downloadImage(imageUrl, outputPath) {
  try {
    console.log(`Downloading image from: ${imageUrl}`);
    
    // Validate URL
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('Invalid image URL provided');
    }

    // Check if this is a Figma URL and convert it
    let finalImageUrl = imageUrl;
    if (imageUrl.includes('figma.com')) {
      console.log('Detected Figma URL, converting to image URL...');
      finalImageUrl = await convertFigmaUrlToImageUrl(imageUrl);
    }

    // Ensure the output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.ensureDir(outputDir);

    // Download the image
    const response = await fetch(finalImageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    // Check if the response is actually an image
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error(`URL does not point to an image. Content-Type: ${contentType}`);
    }

    // Get the image buffer
    const buffer = await response.arrayBuffer();
    
    // Save the image
    await fs.writeFile(outputPath, Buffer.from(buffer));
    
    console.log(`Image downloaded successfully to: ${outputPath}`);
    
    // Verify the file was created and has content
    const stats = await fs.stat(outputPath);
    if (stats.size === 0) {
      throw new Error('Downloaded image file is empty');
    }
    
    console.log(`Image file size: ${stats.size} bytes`);
    
  } catch (error) {
    console.error('Error downloading image:', error);
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

/**
 * Downloads an image with retry logic
 * @param {string} imageUrl - The URL of the image to download
 * @param {string} outputPath - The path where the image should be saved
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<void>}
 */
export async function downloadImageWithRetry(imageUrl, outputPath, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await downloadImage(imageUrl, outputPath);
      return; // Success, exit the retry loop
    } catch (error) {
      lastError = error;
      console.log(`Download attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Failed to download image after ${maxRetries} attempts. Last error: ${lastError.message}`);
} 