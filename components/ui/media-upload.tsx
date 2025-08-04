"use client";

import React, { useState } from 'react';
import { X, Upload, ImageIcon, Video, FileIcon, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UploadButton, UploadDropzone } from '@/utils/uploadthing';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

interface MediaUploadProps {
  type: 'images' | 'videos' | 'mixed';
  maxFiles?: number;
  onUploadComplete: (urls: string[]) => void;
  onRemove: (index: number) => void;
  currentFiles: string[];
  disabled?: boolean;
  className?: string;
  variant?: 'button' | 'dropzone';
}

interface FileUploadResult {
  url: string;
  key: string;
  name: string;
  size: number;
  uploadedBy: string;
}

export function MediaUpload({
  type,
  maxFiles = 4,
  onUploadComplete,
  onRemove,
  currentFiles,
  disabled = false,
  className = '',
  variant = 'button'
}: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const canUploadMore = currentFiles.length < maxFiles;
  const isImageType = type === 'images' || type === 'mixed';
  const isVideoType = type === 'videos' || type === 'mixed';

  const handleUploadBegin = () => {
    setIsUploading(true);
    setUploadError(null);
  };

  const handleUploadComplete = (res: FileUploadResult[]) => {
    if (res && res.length > 0) {
      const newUrls = res.map((file: any) => file.url ?? file.fileUrl).filter(Boolean);
      onUploadComplete(newUrls);
      setUploadError(null);
    }
    setIsUploading(false);
  };

  const handleUploadError = (error: Error) => {
    setUploadError(error.message);
    setIsUploading(false);
  };

  const getFileTypeFromUrl = (url: string): 'image' | 'video' | 'unknown' => {
    const extension = url.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov'];
    
    if (imageExtensions.includes(extension || '')) return 'image';
    if (videoExtensions.includes(extension || '')) return 'video';
    return 'unknown';
  };

  const renderFilePreview = (url: string, index: number) => {
    const fileType = getFileTypeFromUrl(url);
    
    return (
      <div key={index} className="relative group">
        {fileType === 'image' ? (
          <div className="relative">
            <Image
              src={url}
              alt={`Upload ${index + 1}`}
              width={150}
              height={120}
              className="w-full h-32 object-cover rounded-lg border border-gray-200"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              onClick={() => onRemove(index)}
              disabled={disabled}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : fileType === 'video' ? (
          <div className="relative">
            <video
              src={url}
              className="w-full h-32 object-cover rounded-lg border border-gray-200"
              controls={false}
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
              <Video className="w-8 h-8 text-white" />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              onClick={() => onRemove(index)}
              disabled={disabled}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="relative">
            <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
              <div className="text-center">
                <FileIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500 truncate max-w-20">
                  {url.split('/').pop()?.split('.')[0] || 'File'}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              onClick={() => onRemove(index)}
              disabled={disabled}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderUploadButton = (endpoint: keyof OurFileRouter, label: string, icon: React.ReactNode) => (
    <UploadButton<OurFileRouter>
      endpoint={endpoint}
      onUploadBegin={handleUploadBegin}
      onClientUploadComplete={handleUploadComplete}
      onUploadError={handleUploadError}
      disabled={disabled || !canUploadMore}
      className="ut-button:bg-emerald-600 ut-button:hover:bg-emerald-700 ut-button:text-white ut-button:text-sm"
      content={{
        button({ ready }) {
          if (ready) return (
            <div className="flex items-center">
              {icon}
              {label}
            </div>
          );
          return "Getting ready...";
        },
        allowedContent({ ready, isUploading }) {
          if (!ready) return "Checking what you allow";
          if (isUploading) return "Uploading...";
          return "";
        },
      }}
    />
  );

  const renderUploadDropzone = (endpoint: keyof OurFileRouter, label: string) => (
    <UploadDropzone<OurFileRouter>
      endpoint={endpoint}
      onUploadBegin={handleUploadBegin}
      onClientUploadComplete={handleUploadComplete}
      onUploadError={handleUploadError}
      disabled={disabled || !canUploadMore}
      className="ut-border-emerald-300 ut-button:bg-emerald-600 ut-button:hover:bg-emerald-700"
      content={{
        uploadIcon: () => <Upload className="w-8 h-8" />,
        label: () => label,
        allowedContent({ ready, isUploading }) {
          if (!ready) return "Checking what you allow";
          if (isUploading) return "Uploading...";
          return "";
        },
      }}
    />
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File previews */}
      {currentFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {currentFiles.map((url, index) => renderFilePreview(url, index))}
        </div>
      )}

      {/* Upload controls */}
      {canUploadMore && !disabled && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {currentFiles.length > 0 && (
                <Badge variant="outline" className="mr-2">
                  {currentFiles.length}/{maxFiles}
                </Badge>
              )}
              {type === 'images' && `Upload up to ${maxFiles} images (max 4MB each)`}
              {type === 'videos' && `Upload up to ${maxFiles} videos (max 128MB each)`}
              {type === 'mixed' && `Upload up to ${maxFiles} files`}
            </div>
          </div>

          {variant === 'button' ? (
            <div className="flex flex-wrap gap-2">
              {isImageType && renderUploadButton(
                'imageUploader',
                'Upload Images',
                <ImageIcon className="w-4 h-4 mr-2" />
              )}
              {isVideoType && renderUploadButton(
                'videoUploader',
                'Upload Videos',
                <Video className="w-4 h-4 mr-2" />
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {isImageType && renderUploadDropzone('imageUploader', 'Drop images here or click to upload')}
              {isVideoType && renderUploadDropzone('videoUploader', 'Drop videos here or click to upload')}
            </div>
          )}
        </div>
      )}

      {/* Upload status */}
      {isUploading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
          <span className="ml-2 text-sm text-gray-500">Uploading...</span>
        </div>
      )}

      {/* Error display */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* Upload limit reached */}
      {!canUploadMore && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Upload limit reached ({maxFiles} files maximum)
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
