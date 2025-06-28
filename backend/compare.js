import resemble from 'resemblejs';
import fs from 'fs-extra';
import path from 'path';

/**
 * Compares two images using Resemble.js and generates a diff image
 * @param {string} image1Path - Path to the first image (Figma)
 * @param {string} image2Path - Path to the second image (Code)
 * @param {Object} options - Comparison options
 * @returns {Promise<Object>} Comparison result with mismatch percentage and diff image
 */
export async function compareImages(image1Path, image2Path, options = {}) {
  try {
    console.log('Starting image comparison...');
    console.log(`Image 1 (Figma): ${image1Path}`);
    console.log(`Image 2 (Code): ${image2Path}`);

    // Validate input files
    if (!fs.existsSync(image1Path)) {
      throw new Error(`First image not found: ${image1Path}`);
    }
    if (!fs.existsSync(image2Path)) {
      throw new Error(`Second image not found: ${image2Path}`);
    }

    // Default comparison options
    const defaultOptions = {
      output: {
        errorColor: {
          red: 255,
          green: 0,
          blue: 255
        },
        errorType: 'movement',
        transparency: 0.3,
        largeImageThreshold: 1200,
        useCrossOrigin: false,
        outputDiff: true
      },
      scaleToSameSize: true,
      ignore: [
        'antialiasing',
        'colors',
        'less',
        'nothing'
      ]
    };

    const comparisonOptions = { ...defaultOptions, ...options };

    // Ensure assets directory exists for diff image
    const assetsDir = path.dirname(image1Path);
    const diffImagePath = path.join(assetsDir, 'diff.png');

    console.log('Running Resemble.js comparison...');

    // Perform the comparison
    return new Promise((resolve, reject) => {
      resemble(image1Path)
        .compareTo(image2Path)
        .ignoreColors(comparisonOptions.ignore.includes('colors'))
        .ignoreAntialiasing(comparisonOptions.ignore.includes('antialiasing'))
        .scaleToSameSize(comparisonOptions.scaleToSameSize)
        .outputSettings(comparisonOptions.output)
        .onComplete((data) => {
          try {
            console.log('Comparison completed successfully');
            
            // Save the diff image
            if (data.getBuffer) {
              const diffBuffer = data.getBuffer();
              fs.writeFileSync(diffImagePath, diffBuffer);
              console.log(`Diff image saved to: ${diffImagePath}`);
            }

            // Prepare the result
            const result = {
              misMatchPercentage: parseFloat(data.misMatchPercentage),
              isSameDimensions: data.isSameDimensions,
              dimensionDifference: data.dimensionDifference,
              analysisTime: new Date().toISOString(),
              diffImagePath: diffImagePath,
              rawData: {
                rawMisMatchPercentage: parseFloat(data.rawMisMatchPercentage),
                diffBounds: data.diffBounds,
                analysisTime: data.analysisTime
              }
            };

            console.log(`Mismatch percentage: ${data.misMatchPercentage}%`);
            console.log(`Same dimensions: ${data.isSameDimensions}`);
            
            if (data.dimensionDifference) {
              console.log(`Dimension difference: ${JSON.stringify(data.dimensionDifference)}`);
            }

            resolve(result);

          } catch (error) {
            console.error('Error processing comparison result:', error);
            reject(new Error(`Failed to process comparison result: ${error.message}`));
          }
        });
    });

  } catch (error) {
    console.error('Error during image comparison:', error);
    throw new Error(`Image comparison failed: ${error.message}`);
  }
}

/**
 * Compares images with custom tolerance levels
 * @param {string} image1Path - Path to the first image
 * @param {string} image2Path - Path to the second image
 * @param {number} tolerance - Tolerance percentage (0-100)
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Comparison result with pass/fail status
 */
export async function compareImagesWithTolerance(image1Path, image2Path, tolerance = 5, options = {}) {
  const result = await compareImages(image1Path, image2Path, options);
  
  const passed = result.misMatchPercentage <= tolerance;
  
  return {
    ...result,
    passed,
    tolerance,
    status: passed ? 'PASS' : 'FAIL',
    message: passed 
      ? `Images match within tolerance (${tolerance}%)` 
      : `Images exceed tolerance (${tolerance}%). Mismatch: ${result.misMatchPercentage.toFixed(2)}%`
  };
}

/**
 * Compares images and returns detailed analysis
 * @param {string} image1Path - Path to the first image
 * @param {string} image2Path - Path to the second image
 * @param {Object} options - Comparison options
 * @returns {Promise<Object>} Detailed comparison analysis
 */
export async function compareImagesDetailed(image1Path, image2Path, options = {}) {
  const result = await compareImages(image1Path, image2Path, options);
  
  // Get file information
  const image1Stats = fs.statSync(image1Path);
  const image2Stats = fs.statSync(image2Path);
  
  const analysis = {
    ...result,
    fileInfo: {
      image1: {
        path: image1Path,
        size: image1Stats.size,
        modified: image1Stats.mtime
      },
      image2: {
        path: image2Path,
        size: image2Stats.size,
        modified: image2Stats.mtime
      }
    },
    quality: {
      excellent: result.misMatchPercentage <= 1,
      good: result.misMatchPercentage <= 5,
      acceptable: result.misMatchPercentage <= 10,
      poor: result.misMatchPercentage > 10
    },
    recommendations: []
  };

  // Add recommendations based on mismatch percentage
  if (result.misMatchPercentage <= 1) {
    analysis.recommendations.push('Excellent match! The implementation is very close to the design.');
  } else if (result.misMatchPercentage <= 5) {
    analysis.recommendations.push('Good match. Minor adjustments may be needed for pixel-perfect implementation.');
  } else if (result.misMatchPercentage <= 10) {
    analysis.recommendations.push('Acceptable match. Consider reviewing layout, spacing, and styling.');
  } else {
    analysis.recommendations.push('Significant differences detected. Review the design implementation thoroughly.');
  }

  if (!result.isSameDimensions) {
    analysis.recommendations.push('Images have different dimensions. Ensure consistent viewport sizes.');
  }

  return analysis;
} 