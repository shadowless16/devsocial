// lib/cloudinary-client.ts
// Client-side only Cloudinary upload functions

// Type definitions
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  resource_type: string;
  created_at: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

// Client-side upload helper to Cloudinary
export async function uploadToCloudinary(
  file: File,
  preset: string,
  folder?: string,
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);
  if (folder) {
    formData.append('folder', folder);
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured');
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(Math.round(percentComplete));
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch {
          reject(new Error('Failed to parse upload response'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    // Open and send request
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);
    xhr.send(formData);
  });
}

// Helper to upload multiple files
export async function uploadMultipleToCloudinary(
  files: File[],
  preset: string,
  folder?: string,
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult[]> {
  const totalFiles = files.length;
  let completedFiles = 0;
  const results: CloudinaryUploadResult[] = [];

  for (const file of files) {
    const result = await uploadToCloudinary(file, preset, folder, (fileProgress) => {
      // Calculate overall progress
      const overallProgress = ((completedFiles * 100) + fileProgress) / totalFiles;
      if (onProgress) {
        onProgress(Math.round(overallProgress));
      }
    });
    results.push(result);
    completedFiles++;
  }

  return results;
}
