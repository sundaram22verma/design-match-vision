import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { downloadImage } from './downloadImage.js';
import { takeScreenshot } from './screenshot.js';
import { compareImages } from './compare.js';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, 'assets'));
    },
    filename: (req, file, cb) => {
      cb(null, 'figma-upload.png');
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'assets')));

// Ensure assets directory exists
const assetsDir = path.join(__dirname, 'assets');
await fs.ensureDir(assetsDir);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Figma-to-Code comparison server is running' });
});

// Main comparison endpoint
app.post('/compare', async (req, res) => {
  try {
    const { figmaImageUrl, pageUrl } = req.body;

    // Validate input
    if (!figmaImageUrl || !pageUrl) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both figmaImageUrl and pageUrl are required'
      });
    }

    console.log('Starting comparison process...');
    console.log('Figma Image URL:', figmaImageUrl);
    console.log('Page URL:', pageUrl);

    // Step 1: Download Figma image
    console.log('Step 1: Downloading Figma image...');
    const figmaImagePath = path.join(assetsDir, 'figma.png');
    await downloadImage(figmaImageUrl, figmaImagePath);
    console.log('Figma image downloaded successfully');

    // Step 2: Take screenshot of the page
    console.log('Step 2: Taking screenshot of the page...');
    const codeImagePath = path.join(assetsDir, 'code.png');
    await takeScreenshot(pageUrl, codeImagePath);
    console.log('Page screenshot taken successfully');

    // Step 3: Compare images
    console.log('Step 3: Comparing images...');
    const comparisonResult = await compareImages(figmaImagePath, codeImagePath);
    console.log('Image comparison completed');

    // Step 4: Send response
    const response = {
      matchScore: (100 - parseFloat(comparisonResult.misMatchPercentage)).toFixed(2),
      diffImagePath: '/diff.png',
      misMatchPercentage: parseFloat(comparisonResult.misMatchPercentage).toFixed(2),
      analysisTime: new Date().toISOString(),
      originalImages: {
        figma: '/figma.png',
        code: '/code.png'
      }
    };

    console.log('Comparison result:', response);
    res.json(response);

  } catch (error) {
    console.error('Error during comparison:', error);
    res.status(500).json({
      error: 'Comparison failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// File upload comparison endpoint
app.post('/compare-file', upload.single('figmaImage'), async (req, res) => {
  try {
    const { pageUrl } = req.body;
    const uploadedFile = req.file;

    // Validate input
    if (!uploadedFile || !pageUrl) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both figmaImage file and pageUrl are required'
      });
    }

    console.log('Starting file upload comparison process...');
    console.log('Uploaded file:', uploadedFile.originalname);
    console.log('Page URL:', pageUrl);

    // Step 1: Use uploaded Figma image
    console.log('Step 1: Using uploaded Figma image...');
    const figmaImagePath = path.join(assetsDir, 'figma.png');
    // Copy the uploaded file to the standard location
    await fs.copy(uploadedFile.path, figmaImagePath);
    console.log('Figma image ready for comparison');

    // Step 2: Take screenshot of the page
    console.log('Step 2: Taking screenshot of the page...');
    const codeImagePath = path.join(assetsDir, 'code.png');
    await takeScreenshot(pageUrl, codeImagePath);
    console.log('Page screenshot taken successfully');

    // Step 3: Compare images
    console.log('Step 3: Comparing images...');
    const comparisonResult = await compareImages(figmaImagePath, codeImagePath);
    console.log('Image comparison completed');

    // Step 4: Clean up uploaded file
    await fs.remove(uploadedFile.path);

    // Step 5: Send response
    const response = {
      matchScore: (100 - parseFloat(comparisonResult.misMatchPercentage)).toFixed(2),
      diffImagePath: '/diff.png',
      misMatchPercentage: parseFloat(comparisonResult.misMatchPercentage).toFixed(2),
      analysisTime: new Date().toISOString(),
      originalImages: {
        figma: '/figma.png',
        code: '/code.png'
      }
    };

    console.log('File upload comparison result:', response);
    res.json(response);

  } catch (error) {
    console.error('Error during file upload comparison:', error);
    res.status(500).json({
      error: 'File upload comparison failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Serve diff image
app.get('/diff.png', (req, res) => {
  const diffPath = path.join(assetsDir, 'diff.png');
  if (fs.existsSync(diffPath)) {
    res.sendFile(diffPath);
  } else {
    res.status(404).json({ error: 'Diff image not found' });
  }
});

// Serve original images
app.get('/figma.png', (req, res) => {
  const figmaPath = path.join(assetsDir, 'figma.png');
  if (fs.existsSync(figmaPath)) {
    res.sendFile(figmaPath);
  } else {
    res.status(404).json({ error: 'Figma image not found' });
  }
});

app.get('/code.png', (req, res) => {
  const codePath = path.join(assetsDir, 'code.png');
  if (fs.existsSync(codePath)) {
    res.sendFile(codePath);
  } else {
    res.status(404).json({ error: 'Code image not found' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Figma-to-Code comparison server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Comparison endpoint: http://localhost:${PORT}/compare`);
}); 