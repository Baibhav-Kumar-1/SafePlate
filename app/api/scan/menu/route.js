import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getDBModels } from '@/lib/db';
import { performOCR, cleanOCRText } from '@/lib/ocr';
import { processImage } from '@/lib/imageUtils';
import {
  detectAllergens,
  extractMenuItems,
  calculateAllergenConfidence
} from '@/lib/menuProcessing';

export async function POST(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get form data with image
    let formData;
    try {
      formData = await req.formData();
    } catch (error) {
      console.error('Error parsing form data:', error);
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      );
    }

    const image = formData.get('image');
    console.log('Received image:', image ? `${image.type}, ${image.size} bytes` : 'none');

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Allow any file type
    console.log('Processing file:', image.type || 'unknown');

    // Validate image size
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (image.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Image too large (max 10MB)' },
        { status: 400 }
      );
    }

    // Get user's allergens
    const { User } = await getDBModels();
    const user = await User.findById(session.user.id);
    const userAllergens = user?.allergens || [];

    console.log('Processing menu image for user:', session.user.email);

    // Process the image
    let ocrResult;
    try {
      console.log('Processing image...');
      // Convert and process image
      const processedImage = await processImage(image);
      ocrResult = await performOCR(processedImage);
      console.log('Image processing completed');
      
      if (!ocrResult.text) {
        return NextResponse.json(
          { error: 'No text detected in image' },
          { status: 422 }
        );
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      return NextResponse.json(
        { error: 'Failed to process image text' },
        { status: 500 }
      );
    }

    const cleanedText = cleanOCRText(ocrResult.text);
    console.log('Cleaned text length:', cleanedText.length);

    // Process menu text
    let menuItems, allergens;
    try {
      menuItems = extractMenuItems(cleanedText);
      allergens = detectAllergens(cleanedText);

      if (menuItems.length === 0) {
        return NextResponse.json(
          { error: 'No menu items detected in image' },
          { status: 422 }
        );
      }
    } catch (error) {
      console.error('Menu processing error:', error);
      return NextResponse.json(
        { error: 'Failed to process menu content' },
        { status: 500 }
      );
    }

    // Generate warnings based on user's allergens
    const warnings = allergens
      .filter(({ allergen }) =>
        userAllergens.some(ua => 
          ua.name.toLowerCase() === allergen.toLowerCase()
        )
      )
      .map(({ allergen, mentions }) => {
        const userAllergen = userAllergens.find(ua => 
          ua.name.toLowerCase() === allergen.toLowerCase()
        );
        return {
          allergen,
          severity: userAllergen?.severity || 'unknown',
          mentions,
        };
      });

    // Calculate confidence scores
    const menuItemsWithConfidence = menuItems.map(item => ({
      ...item,
      confidence: calculateAllergenConfidence(item),
    }));

    // Sanitize data for storage and response
    const sanitizedMenuItems = menuItemsWithConfidence.map(item => ({
      ...item,
      name: item.name?.substring(0, 200), // Limit name length
      description: item.description?.substring(0, 1000), // Limit description length
    }));

    const sanitizedWarnings = warnings.map(w => ({
      ...w,
      mentions: w.mentions.slice(0, 10), // Limit number of mentions
    }));

    // Save scan to user's history
    try {
      await User.findByIdAndUpdate(session.user.id, {
        $push: {
          scanHistory: {
            scannedAt: new Date(),
            menuItems: sanitizedMenuItems,
            warnings: sanitizedWarnings,
            ocrText: cleanedText, // Store full text
            ocrConfidence: ocrResult.confidence,
          }
        }
      });
    } catch (error) {
      console.error('Database error:', error);
      // Continue with response even if history save fails
    }

    // Prepare and validate response data
    try {
      const responseData = {
        success: true,
        data: {
          menuItems: sanitizedMenuItems,
          warnings: sanitizedWarnings,
          text: cleanedText, // Send full text
          confidence: ocrResult.confidence,
          timestamp: new Date().toISOString(),
        }
      };

      // Test JSON serialization
      JSON.stringify(responseData);
      
      return NextResponse.json(responseData);
    } catch (error) {
      console.error('Response preparation error:', error);
      // Return simplified response if full response fails
      return NextResponse.json({
        success: true,
        data: {
          menuItemsCount: menuItemsWithConfidence.length,
          warningsCount: warnings.length,
          confidence: ocrResult.confidence,
          timestamp: new Date().toISOString(),
        }
      });
    }

  } catch (error) {
    console.error('Menu scan error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process menu image',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}