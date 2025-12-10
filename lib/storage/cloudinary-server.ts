import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary for server-side operations
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Server-side upload function with more control
export const uploadToCloudinaryServer = async (
  filePath: string,
  options?: {
    folder?: string;
    publicId?: string;
    transformation?: unknown[];
  }
) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: options?.folder || 'posts',
      public_id: options?.publicId,
      transformation: options?.transformation,
    });
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Server-side Cloudinary upload error:', errorMessage);
    throw error;
  }
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Cloudinary delete error:', errorMessage);
    throw error;
  }
};

// Generate signed upload URL for secure uploads
export const generateSignedUploadUrl = () => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      upload_preset: 'devsocial',
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  };
};

export default cloudinary;
