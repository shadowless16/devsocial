import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server-auth';
import cloudinary from '@/lib/storage/cloudinary-server';
import { type UploadApiResponse } from 'cloudinary';

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result: UploadApiResponse = await cloudinary.uploader.upload(fileBase64, {
      folder: 'avatars',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Square crop focused on face
        { quality: 'auto:good' }
      ],
      public_id: `avatar_${session.user.email}_${Date.now()}` // Unique ID for each user
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Avatar upload error:', errorMessage);
    return NextResponse.json(
      { success: false, message: 'Upload failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
