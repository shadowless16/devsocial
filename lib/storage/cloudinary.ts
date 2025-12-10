// This file contains client-side Cloudinary utilities
// Server-side utilities should be in a separate file

export interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
}

// Client-side upload function - uses API route for security
export const uploadToCloudinary = async (
  file: File,
  folder: string = 'posts'
): Promise<CloudinaryUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Upload response error:', errorData);
      throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    // Map the response to match CloudinaryUploadResult interface
    return {
      ...data,
      version: data.version || Date.now(),
      signature: data.signature || '',
      created_at: data.created_at || new Date().toISOString(),
      tags: data.tags || [],
      bytes: data.bytes || 0,
      type: data.type || 'upload',
      etag: data.etag || '',
      placeholder: false,
      folder: data.folder || folder,
      original_filename: data.original_filename || file.name,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    console.error('Upload error:', errorMessage);
    throw error;
  }
};

// Upload multiple files
export const uploadMultipleToCloudinary = async (
  files: File[],
  folder: string = 'posts',
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult[]> => {
  const totalFiles = files.length;
  let completedFiles = 0;

  const uploadPromises = files.map(async (file) => {
    const result = await uploadToCloudinary(file, folder);
    completedFiles++;
    if (onProgress) {
      onProgress((completedFiles / totalFiles) * 100);
    }
    return result;
  });

  return Promise.all(uploadPromises);
};

// Get optimized image URL
export const getCloudinaryUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    crop?: string;
  } = {}
): string => {
  const { width, height, quality = 100, format = 'auto', crop = 'fill' } = options;
  
  const transformations = [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`, `f_${format}`, `c_${crop}`);
  
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformations.join(',')}/${publicId}`;
};

// Video thumbnail URL
export const getVideoThumbnail = (publicId: string): string => {
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/so_0/${publicId}.jpg`;
};

// Get high-quality image URL without any compression
export const getHighQualityImageUrl = (url: string): string => {
  // If it's already a Cloudinary URL, ensure it has quality=100
  if (url.includes('res.cloudinary.com')) {
    // Remove any existing quality parameters
    const baseUrl = url.split('/upload/')[0] + '/upload/';
    const imagePath = url.split('/upload/')[1];
    
    // Add quality=100 transformation
    return `${baseUrl}q_100/${imagePath}`;
  }
  
  // Return original URL if not Cloudinary
  return url;
};
