import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
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

// Generate dummy try-on result (similar to frontend logic)
async function generateTryOnResult(productImagePath) {
  // Extract filename from product image path
  const filename = productImagePath.split('/').pop() || productImagePath.split('\\').pop() || '';
  
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

    // Parse form data
    const formData = await request.formData();
    const userImage = formData.get('user_image');
    const productImage = formData.get('product_image');
    const responseFormat = formData.get('response_format') || 'url';

    // Validate inputs
    if (!userImage || !productImage) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: user_image and product_image are required.' },
        { status: 400 }
      );
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(userImage.type) || !allowedTypes.includes(productImage.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Save uploaded files temporarily
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'api');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const userImagePath = join(uploadsDir, `user_${Date.now()}_${userImage.name}`);
    const productImagePath = join(uploadsDir, `product_${Date.now()}_${productImage.name}`);

    const userImageBuffer = Buffer.from(await userImage.arrayBuffer());
    const productImageBuffer = Buffer.from(await productImage.arrayBuffer());

    await writeFile(userImagePath, userImageBuffer);
    await writeFile(productImagePath, productImageBuffer);

    // Generate try-on result
    // In a real implementation, you'd process the images here
    // For now, we'll use the dummy output image logic
    const productImageUrl = `/uploads/api/${productImagePath.split(/[/\\]/).pop()}`;
    const outputImagePath = await generateTryOnResult(productImageUrl);

    // Prepare response based on format
    let resultUrl = '';
    let resultBase64 = '';

    if (responseFormat === 'base64') {
      resultBase64 = await imageToBase64(outputImagePath);
    } else {
      // Generate a public URL for the result
      // In production, you'd upload to a CDN or storage service
      resultUrl = outputImagePath; // For now, return the path
    }

    // Clean up temporary files (optional, or keep for a period)
    // await unlink(userImagePath);
    // await unlink(productImagePath);

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

