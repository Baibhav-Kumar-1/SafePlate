import sharp from 'sharp';

/**
 * Convert image to PNG format
 * @param {Buffer} imageBuffer - Original image buffer
 * @returns {Promise<Buffer>} PNG image buffer
 */
export async function convertToPNG(imageBuffer) {
  try {
    const pngBuffer = await sharp(imageBuffer)
      .png()
      .toBuffer();
    console.log('Image converted to PNG format');
    return pngBuffer;
  } catch (error) {
    console.error('Error converting image to PNG:', error);
    throw new Error('Failed to convert image to PNG format');
  }
}

/**
 * Process camera capture or uploaded image
 * @param {Blob|File} imageData - Image data from camera or file upload
 * @returns {Promise<Buffer>} Processed image buffer
 */
export async function processImage(imageData) {
  try {
    let buffer;
    
    // Convert image data to buffer
    if (imageData instanceof Blob || imageData instanceof File) {
      const arrayBuffer = await imageData.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      throw new Error('Invalid image data format');
    }

    // If not PNG, convert to PNG
    if (imageData.type !== 'image/png') {
      console.log('Converting image from', imageData.type, 'to PNG');
      return await convertToPNG(buffer);
    }

    return buffer;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image: ' + error.message);
  }
}