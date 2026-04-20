import { NextResponse } from 'next/server';
import { existsSync } from 'fs';

// Verify API key
// In production, this should check against a database
function verifyApiKey(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const apiKey = authHeader.replace('Bearer ', '');
  
  // Basic format validation
  // In production, query database: SELECT * FROM api_keys WHERE key = ? AND active = true
  if (!apiKey.startsWith('vto_') || apiKey.length < 20) {
    return false;
  }
  
  // For now, we accept any key with the correct format
  // In production, verify against database
  return true;
}

// Download image from URL
async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image from ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Generate dummy try-on result (similar to frontend logic)
async function generateTryOnResult(productImageUrl) {
  // Extract filename from product image URL
  const urlParts = productImageUrl.split('/');
  const filename = urlParts[urlParts.length - 1];
  
  // Use the corresponding output image from /output folder
  const outputImagePath = filename ? `/output/${filename}` : '/output/placeholder.jpg';
  
  // In a real implementation, you'd process the images here
  // For now, return the path to the output image
  return outputImagePath;
}

// Convert image to base64
async function imageToBase64(imagePath) {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Resolve the public path
    const publicPath = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''));
    
    if (!existsSync(publicPath)) {
      throw new Error('Output image not found');
    }
    
    const imageBuffer = await fs.promises.readFile(publicPath);
    const base64 = imageBuffer.toString('base64');
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
    
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

// Convert image URL to base64
async function imageUrlToBase64(imageUrl) {
  try {
    const imageBuffer = await downloadImage(imageUrl);
    const base64 = imageBuffer.toString('base64');
    const mimeType = imageUrl.endsWith('.png') ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error converting image URL to base64:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    // Verify API key
    const authHeader = request.headers.get('authorization');
    if (!verifyApiKey(authHeader)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Invalid or missing API key.' },
        { status: 401 }
      );
    }

    // Parse JSON body
    const body = await request.json();
    const { user_image_url, product_image_url, response_format = 'url' } = body;

    // Validate inputs
    if (!user_image_url || !product_image_url) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: user_image_url and product_image_url are required.' },
        { status: 400 }
      );
    }

    // Validate URLs
    try {
      new URL(user_image_url);
      new URL(product_image_url);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid URL format.' },
        { status: 400 }
      );
    }

    // Download images to verify they're accessible
    try {
      await downloadImage(user_image_url);
      await downloadImage(product_image_url);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: `Failed to access image: ${error.message}` },
        { status: 400 }
      );
    }

    // Generate try-on result
    // In a real implementation, you'd process the images here
    // For now, we'll use the dummy output image logic
    const outputImagePath = await generateTryOnResult(product_image_url);

    // Prepare response based on format
    let resultUrl = '';
    let resultBase64 = '';

    if (response_format === 'base64') {
      resultBase64 = await imageToBase64(outputImagePath);
    } else {
      // Generate a public URL for the result
      // In production, you'd upload to a CDN or storage service
      resultUrl = outputImagePath; // For now, return the path
    }

    return NextResponse.json({
      success: true,
      data: {
        result_url: resultUrl || undefined,
        result_base64: resultBase64 || undefined,
      },
      message: 'Try-on generated successfully',
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

