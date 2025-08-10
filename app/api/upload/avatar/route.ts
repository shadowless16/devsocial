import { NextRequest, NextResponse } from 'next/server';

// Helper function to generate DiceBear avatar
function generateDiceBearAvatar(seed: string, style: string = 'adventurer'): string {
  return `https://api.dicebear.com/8.x/${style}/svg?seed=${seed}`;
}

// Helper function to validate file type
function isValidImageFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(file.type);
}

// Helper function to validate file size (max 5MB)
function isValidFileSize(file: File): boolean {
  const maxSize = 5 * 1024 * 1024; // 5MB
  return file.size <= maxSize;
}


export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

    // If no file provided, generate DiceBear avatar
    if (!file) {
      if (!userId) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'User ID is required when no file is provided' 
          },
          { status: 400 }
        );
      }

      // Generate DiceBear avatar based on user ID
      const avatarUrl = generateDiceBearAvatar(userId);
      
      return NextResponse.json({
        success: true,
        url: avatarUrl,
        type: 'generated',
        message: 'DiceBear avatar generated successfully',
        metadata: {
          style: 'adventurer',
          seed: userId,
          service: 'dicebear'
        }
      });
    }

    // Validate file type
    if (!isValidImageFile(file)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid file type. Only jpg, png, gif, webp are allowed' 
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (!isValidFileSize(file)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'File too large. Maximum size is 5MB' 
        },
        { status: 400 }
      );
    }

    // Mock file upload logic
    // In real implementation, you would:
    // 1. Upload file to cloud storage (S3, Cloudinary, etc.)
    // 2. Generate optimized versions (thumbnails, webp, etc.)
    // 3. Update user record in database
    // 4. Delete old avatar if it exists
    // 5. Return new avatar URL

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock uploaded URL
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `avatar_${userId || 'user'}_${timestamp}.${fileExtension}`;
    
    // Mock different cloud storage providers
    const cloudProviders = [
      'https://res.cloudinary.com/devsocial/image/upload/v1234567890',
      'https://devsocial.s3.amazonaws.com/avatars',
      'https://storage.googleapis.com/devsocial-bucket/avatars'
    ];
    
    const mockProvider = cloudProviders[Math.floor(Math.random() * cloudProviders.length)];
    const mockUrl = `${mockProvider}/${filename}`;

    const response = {
      success: true,
      url: mockUrl,
      filename: filename,
      size: file.size,
      type: 'uploaded' as const,
      mimeType: file.type,
      message: 'Avatar uploaded successfully',
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        provider: mockProvider.includes('cloudinary') ? 'cloudinary' : 
                 mockProvider.includes('s3') ? 's3' : 'gcs'
      }
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in avatar upload API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Upload failed. Please try again.' 
      },
      { status: 500 }
    );
  }
}

// GET method to get current avatar or generate new DiceBear
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const style = searchParams.get('style') || 'adventurer';
    const regenerate = searchParams.get('regenerate') === 'true';

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User ID is required' 
        },
        { status: 400 }
      );
    }

    // Generate or regenerate DiceBear avatar
    const seed = regenerate ? `${userId}_${Date.now()}` : userId;
    const avatarUrl = generateDiceBearAvatar(seed, style);

    return NextResponse.json({
      success: true,
      url: avatarUrl,
      type: 'generated',
      metadata: {
        style: style,
        seed: seed,
        service: 'dicebear',
        regenerated: regenerate
      }
    });
    
  } catch (error) {
    console.error('Error in avatar generation API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate avatar' 
      },
      { status: 500 }
    );
  }
}
