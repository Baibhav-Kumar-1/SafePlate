import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Process an image using Gemini Vision
 * @param {Buffer|Blob} imageData - The image data to process
 * @returns {Promise<{text: string, confidence: number}>}
 */
export async function performOCR(imageData) {
  try {
    console.log('Initializing Gemini Vision...');
    
    // Create model and start chat
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    let imageInput;
    try {
      // Convert image data to base64
      let base64Image;
      // Use the actual mime type from the image
      const mimeType = imageData.type || 'image/png';

      console.log('Image data type:', typeof imageData, Object.prototype.toString.call(imageData));
      if (imageData instanceof Buffer) {
        // Direct Buffer input
        base64Image = imageData.toString('base64');
        console.log('Processed Buffer input');
      } else if (imageData instanceof Blob) {
        // Blob input
        const arrayBuffer = await imageData.arrayBuffer();
        base64Image = Buffer.from(arrayBuffer).toString('base64');
        console.log('Processed Blob input');
      } else if (imageData.buffer instanceof ArrayBuffer) {
        // ArrayBuffer or TypedArray input
        base64Image = Buffer.from(imageData.buffer).toString('base64');
        console.log('Processed ArrayBuffer input');
      } else if (imageData instanceof FormData) {
        // FormData input
        const file = imageData.get('image');
        const arrayBuffer = await file.arrayBuffer();
        base64Image = Buffer.from(arrayBuffer).toString('base64');
        console.log('Processed FormData input');
      } else {
        console.error('Unsupported image data:', imageData);
        throw new Error('Unsupported image data format');
      }

      // Prepare image data for Gemini
      imageInput = {
        inlineData: {
          data: base64Image,
          mimeType
        }
      };
    } catch (error) {
      console.error('Error converting image data:', error);
      throw new Error('Failed to process image data: ' + error.message);
    }

    console.log('Processing image with Gemini Vision...');

    // Ask Gemini to extract menu information in JSON format
    const result = await model.generateContent([
      'Extract all menu items from this image along with their prices. For each item, if you can identify common ingredients used to make it, list them. If ingredients are not visible in the menu, provide common ingredients typically used. Format the output as a structured JSON with the following structure:\n\n```json\n{\n  "menu": [\n    {\n      "category": "Category Name",\n      "items": [\n        {\n          "name": "Item Name",\n          "price": Price,\n          "ingredients": ["Ingredient1", "Ingredient2", "etc."]\n        }\n      ]\n    }\n  ]\n}\n```\n\nEnsure that each item is categorized appropriately based on its section in the menu.',
      imageInput
    ]);
    const response = await result.response;
    const text = response.text();
    
    console.log('Gemini processing completed');
    console.log('Raw Gemini response:', text);
    
    return {
      text,
      confidence: 1, // Gemini doesn't provide confidence scores
      words: [], // Not needed for Gemini implementation
    };
  } catch (error) {
    console.error('Gemini processing error:', error);
    throw new Error('Failed to process image: ' + error.message);
  }
}

/**
 * Clean up menu text from Gemini
 * @param {string} text - Raw text from Gemini
 * @returns {string}
 */
export function cleanOCRText(text) {
  if (!text) return '';
  return text
    .replace(/[\r\n]+/g, '\n')      // Normalize line breaks
    .replace(/[^\S\r\n]+/g, ' ')    // Normalize spaces
    .trim();
}

/**
 * Extract menu items from Gemini text
 * @param {string} text - Cleaned text
 * @returns {Array<{name: string, description: string, price: string, ingredients: string}>}
 */
export function extractMenuItems(text) {
  if (!text) return [];
  
  console.log('Raw text before processing:', text);
  
  try {
    // Find JSON content between ```json and ``` markers
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) {
      // Try parsing the entire text as JSON
      const menuData = JSON.parse(text);
      return flattenMenuData(menuData);
    }
    
    // Parse the JSON content
    const menuData = JSON.parse(jsonMatch[1]);
    return flattenMenuData(menuData);
  } catch (error) {
    console.error('Error parsing menu JSON:', error);
    return [];
  }
}

/**
 * Flatten menu data from JSON structure to array of menu items
 * @param {Object} menuData - Parsed JSON menu data
 * @returns {Array<{category: string, name: string, price: string, ingredients: Array<string>}>}
 */
function flattenMenuData(menuData) {
  if (!menuData?.menu) return [];
  
  const flattened = [];
  
  for (const categoryData of menuData.menu) {
    const { category, items } = categoryData;
    
    for (const item of items) {
      flattened.push({
        category,
        name: item.name,
        description: '',
        price: typeof item.price === 'number' ? `₹${item.price}` : item.price,
        ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(', ') : item.ingredients
      });
    }
  }
  
  console.log('Extracted menu items:', flattened);
  return flattened;
}

/**
 * Get text around a keyword for context
 * @param {string} text - Full text
 * @param {string} word - Word to find context for
 * @returns {string}
 */
export function getWordContext(text, word) {
  if (!text || !word) return '';
  
  const wordIndex = text.toLowerCase().indexOf(word.toLowerCase());
  if (wordIndex === -1) return '';

  const start = Math.max(0, wordIndex - 50);
  const end = Math.min(text.length, wordIndex + word.length + 50);
  
  return text.slice(start, end).trim();
}