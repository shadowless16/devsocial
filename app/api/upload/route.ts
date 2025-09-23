import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary-server';
import { type UploadApiResponse } from 'cloudinary';


export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // For videos, use chunked upload to avoid timeouts
    const isVideo = file.type.startsWith('video/');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let result: UploadApiResponse | undefined;
    
    if (isVideo) {
      // Use upload_stream for videos to handle large files better
      result = await new Promise<UploadApiResponse | undefined>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'posts',
            resource_type: 'video',
            chunk_size: 6000000, // 6MB chunks
            timeout: 120000, // 2 minute timeout
            allowed_formats: ['mp4', 'webm', 'mov', 'avi'],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        // Write buffer to stream
        uploadStream.end(buffer);
      });
    } else {
      // For images, use the regular upload with base64
      const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;
      result = await cloudinary.uploader.upload(fileBase64, {
        folder: 'posts',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          { width: 2000, height: 2000, crop: 'limit' }, // Limit max dimensions
          { quality: 'auto:best' } // Use best quality
        ]
      });
    }

    if (!result) {
      return NextResponse.json({ error: 'Upload failed to return a result' }, { status: 500 });
    }

    return NextResponse.json({
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      format: result.format,
      width: result.width,
      height: result.height,
      resource_type: result.resource_type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
