# File Upload Integration Guide

## Overview

This guide covers the comprehensive file upload integration in your DevSocial project, including image, video, and general file uploads using UploadThing.

## Features Implemented

### 1. UploadThing Configuration
- **Image Uploader**: Upload up to 4 images (max 4MB each)
- **Video Uploader**: Upload 1 video (max 128MB)
- **Avatar Uploader**: Upload 1 profile image (max 2MB)
- **File Uploader**: Upload general files including PDFs, documents (max 16MB, up to 5 files)

### 2. Enhanced Post Modals
Both `PostModal` and `EnhancedPostModal` now support:
- Multiple image uploads with preview
- Video uploads with preview
- Drag & drop functionality
- Upload progress indicators
- Error handling
- File removal capabilities

### 3. Feed Display
The `FeedItem` component now supports:
- Multiple image display with smart grid layouts
- Video playback controls
- Legacy single image support
- Responsive design for different screen sizes

### 4. Reusable Components
- **MediaUpload Component**: A comprehensive, reusable upload component
- Supports different file types and limits
- Customizable variants (button or dropzone)
- Built-in preview and management

## Usage Examples

### Basic Image Upload in Post Modal
```tsx
import { PostModal } from '@/components/modals/post-modal';

// The modal now automatically handles image and video uploads
<PostModal 
  isOpen={true}
  onClose={() => setModalOpen(false)}
  onSubmit={(postData) => {
    // postData now includes:
    // - imageUrls: string[]
    // - videoUrls: string[]
    // - imageUrl: string (legacy)
  }}
/>
```

### Using the MediaUpload Component
```tsx
import { MediaUpload } from '@/components/ui/media-upload';

function MyComponent() {
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);

  return (
    <MediaUpload
      type="mixed" // or "images" or "videos"
      maxFiles={4}
      currentFiles={mediaFiles}
      onUploadComplete={(newUrls) => {
        setMediaFiles([...mediaFiles, ...newUrls]);
      }}
      onRemove={(index) => {
        setMediaFiles(mediaFiles.filter((_, i) => i !== index));
      }}
      variant="dropzone" // or "button"
    />
  );
}
```

## Database Schema Updates

The Post model already supports:
```typescript
interface IPost {
  imageUrl?: string;      // Legacy single image
  imageUrls?: string[];   // Multiple images
  videoUrls?: string[];   // Multiple videos
  // ... other fields
}
```

## API Integration

The posts API endpoint (`/api/posts`) automatically handles:
- Multiple image URLs
- Multiple video URLs
- Legacy single image URL support

## Upload Endpoints

### Available UploadThing Endpoints:
- `imageUploader`: For post images (4MB max, 4 files)
- `videoUploader`: For post videos (128MB max, 1 file)
- `avatarUploader`: For profile pictures (2MB max, 1 file)
- `fileUploader`: For general files (16MB max, 5 files)

## Security Features

- **Authentication Required**: All uploads require valid user session
- **File Type Validation**: Server-side validation of file types
- **Size Limits**: Enforced limits prevent abuse
- **Error Handling**: Comprehensive error handling and user feedback

## Troubleshooting

### Common Issues:

1. **Mongoose Virtual Path Error**: Fixed by removing conflicting field aliases in UserStats model
2. **Upload Failures**: Check authentication and file size limits
3. **Preview Issues**: Ensure proper URL handling for different file types

### Environment Variables Required:
```env
UPLOADTHING_TOKEN=your_uploadthing_token
UPLOADTHING_SECRET=your_uploadthing_secret
```

## Future Enhancements

### Potential Improvements:
1. **Image Compression**: Add client-side image compression before upload
2. **Video Thumbnails**: Generate video thumbnails automatically
3. **File Organization**: Organize uploads by user/date folders
4. **CDN Integration**: Add CDN support for better performance
5. **Progress Tracking**: More detailed upload progress indicators

### Code Structure:
```
components/
├── modals/
│   ├── post-modal.tsx (Enhanced with uploads)
│   └── enhanced-post-modal.tsx (Full featured)
├── feed/
│   └── FeedItem.tsx (Multi-media support)
└── ui/
    └── media-upload.tsx (Reusable component)

app/api/
├── uploadthing/
│   ├── core.ts (Upload configuration)
│   └── route.ts (Route handler)
└── posts/
    └── route.ts (Updated to handle media URLs)

utils/
└── uploadthing.ts (Client utilities)
```

## Testing Checklist

- [ ] Image uploads work in post modal
- [ ] Video uploads work in post modal
- [ ] Multiple images display correctly in feed
- [ ] Videos play correctly in feed
- [ ] File removal works properly
- [ ] Upload errors are handled gracefully
- [ ] Authentication is enforced
- [ ] File size limits are respected

## Performance Considerations

1. **Lazy Loading**: Images and videos should be lazy-loaded
2. **Compression**: Consider implementing client-side compression
3. **Caching**: Implement proper caching strategies
4. **CDN**: Use CDN for better global performance
5. **Optimization**: Optimize images for web delivery

This integration provides a robust, user-friendly file upload system that enhances the posting experience while maintaining security and performance standards.
